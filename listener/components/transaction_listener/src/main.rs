use std::env;
use std::str::FromStr;
use std::sync::Arc;

use dotenv::dotenv;
use ethers::core::types::{H160, U256};
use ethers::middleware::Middleware;
use ethers::providers::StreamExt;
use ethers::providers::{Provider, Ws};
use sqlx::postgres::PgPool;
use sqlx::types::BigDecimal;

// this is so incredibly cursed lmao
fn u256_to_big_decimal(u256: U256) -> BigDecimal {
    BigDecimal::from_str(&u256.to_string()).unwrap()
}

async fn mark_as_paid(pool: &PgPool, from_address: &str, amount: U256) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        UPDATE bounties
        SET paid = TRUE
        WHERE creator_address = $1
          AND amount = $2
          AND paid = FALSE
        "#,
        from_address,
        u256_to_big_decimal(amount)
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let ws_url = env::var("WS_URL").expect("WS_URL must be set");

    let provider = Provider::<Ws>::connect(ws_url.clone()).await?;
    let provider = Arc::new(provider);

    let target_address: H160 = "0x4307f766ED0fF932ce3367e1177180FfA647C46D".parse()?;

    let mut stream = provider.subscribe_blocks().await?;

    let pool =
        PgPool::connect(&env::var("DATABASE_URL").expect("DATABASE_URL must be set")).await?;

    println!("Listening for new blocks via ws...");

    while let Some(block) = stream.next().await {
        if let Some(full_block) = provider.get_block_with_txs(block.hash.unwrap()).await? {
            println!("New block: {:?}", full_block.number);

            for tx in full_block.transactions {
                if let Some(to_address) = tx.to {
                    if to_address == target_address && tx.value > U256::zero() {
                        println!(
                            "New transaction: {} ETH from {} in block {}",
                            ethers::utils::format_units(tx.value, "ether").unwrap(),
                            tx.from,
                            full_block.number.unwrap()
                        );

                        mark_as_paid(&pool, &format!("{:x?}", tx.from), tx.value).await?;
                    }
                }
            }
        }
    }

    Ok(())
}
