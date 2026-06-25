#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, vec};

#[test]
fn test_init_and_admin() {
    let env = Env::default();
    let contract_id = env.register_contract(None, VoxChainVotingContract);
    let client = VoxChainVotingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let native = Address::generate(&env);

    client.initialize(&admin, &native);

    let stats = client.get_stats();
    assert_eq!(stats, (0, 0));
}

#[test]
fn test_create_proposal() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, VoxChainVotingContract);
    let client = VoxChainVotingContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let native = Address::generate(&env);
    client.initialize(&admin, &native);

    let cur_time = env.ledger().timestamp();
    let title = String::from_str(&env, "Treasury Allocation");
    let desc = String::from_str(&env, "Spend 10,000 XLM on Marketing");
    let category = String::from_str(&env, "Finance");
    let options = vec![&env, String::from_str(&env, "Yes"), String::from_str(&env, "No")];

    let proposal_id = client.create_proposal(
        &title,
        &desc,
        &cur_time,
        &(cur_time + 3600),
        &options,
        &100u64,
        &category,
        &0i128,
    );

    assert_eq!(proposal_id, 0);

    let stats = client.get_stats();
    assert_eq!(stats.0, 1);
}

#[test]
fn test_vote() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, VoxChainVotingContract);
    let client = VoxChainVotingContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let native = Address::generate(&env);
    client.initialize(&admin, &native);

    let cur_time = env.ledger().timestamp();
    let title = String::from_str(&env, "Test Prop");
    let desc = String::from_str(&env, "Test Desc");
    let category = String::from_str(&env, "General");
    let options = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];

    let pid = client.create_proposal(
        &title,
        &desc,
        &cur_time,
        &(cur_time + 3600),
        &options,
        &0u64,
        &category,
        &0i128,
    );

    let voter = Address::generate(&env);
    let tx_hash = String::from_str(&env, "hash123");

    client.vote(&voter, &pid, &0u32, &tx_hash);

    let stats = client.get_stats();
    assert_eq!(stats.1, 1);

    assert_eq!(client.has_voted(&voter, &pid), true);
}
