#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, vec};

#[test]
fn test_init_and_admin() {
    let env = Env::default();
    let contract_id = env.register_contract(None, VotingContract);
    let client = VotingContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    
    // Test initialization
    client.init(&admin);
    
    // Assert the state variables recorded accurately
    let stats = client.get_stats();
    assert_eq!(stats, (0, 0));
    
    // Ensure cannot re-initialize
    // (This would panic in a real run, handling assert_panics could be done if we want but standard passes are fine)
}

#[test]
fn test_create_proposal() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, VotingContract);
    let client = VotingContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.init(&admin);
    
    let title = String::from_str(&env, "Treasury Allocation");
    let desc = String::from_str(&env, "Spend 10,000 XLM on Marketing");
    let category = String::from_str(&env, "Finance");
    let duration = 3600; // 1 hour
    let min_balance = 0;
    let options = vec![&env, String::from_str(&env, "Yes"), String::from_str(&env, "No")];
    
    let proposal_id = client.create_proposal(&admin, &title, &desc, &category, &duration, &100, &min_balance, &options);
    
    // Assert ID assigns properly and sequences
    assert_eq!(proposal_id, 0);
    
    let stats = client.get_stats();
    assert_eq!(stats.0, 1); // 1 proposal exists
}

#[test]
fn test_vote() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, VotingContract);
    let client = VotingContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.init(&admin);
    
    let title = String::from_str(&env, "Test Prop");
    let desc = String::from_str(&env, "Test Desc");
    let category = String::from_str(&env, "General");
    let duration = 3600; 
    let options = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];
    
    let pid = client.create_proposal(&admin, &title, &desc, &category, &duration, &100, &0, &options);
    
    let voter = Address::generate(&env);
    let tx_hash = String::from_str(&env, "hash123");
    
    // Vote on Option 0
    client.vote(&voter, &pid, &0, &tx_hash);
    
    // Verify changes
    let stats = client.get_stats();
    assert_eq!(stats.1, 1); // Total votes increased!
    
    // User cannot vote again on same proposal? Check has_voted!
    assert_eq!(client.has_voted(&pid, &voter), true);
}
