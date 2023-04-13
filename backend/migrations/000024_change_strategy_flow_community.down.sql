UPDATE communities SET
    twitter_url = 'https://twitter.com/flow_blockchain', 
    discord_url = 'https://discord.gg/flow',
    strategies = '[{"name": "one-address-one-vote", "contract": {"addr": "0x1654653399040a61", "name": "FlowToken", "threshold": "0", "publicPath": "flowTokenBalance"}}]'
WHERE id = 1;
