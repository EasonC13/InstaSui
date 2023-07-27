module insta::insta_management {
    use insta::insta_nft;
    use sui::url::{Self, Url};
    use std::string;
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};

    /// Trying to withdraw higher pre_paid than stored.
    const ENotAllow: u64 = 1;
    
    /// Trying to withdraw higher pre_paid than stored.
    const ENotEnough: u64 = 2;

    struct INSTA_MANAGEMENT has drop {}

    struct CreatorCap has key {
        id: UID,
    }
    struct SignerCap has key {
        id: UID,
        version: u64,
        deposit: Deposited,
    }
    struct InstaConfig has key {
        id: UID,
        isInited: bool,
        creator: address,
        is_request_withdraw: bool,
        is_freezed: bool,
        rate_limit_per_hour: u64,
        version: u64,
        // Minimum gas fee allow.
        minimum_gas: u64,
        pre_paid_supply: Balance<SUI>,
        redeem_gas_fee: Balance<SUI>,
    }
    struct Deposited has key, store {
        id: UID,
        pre_paid: u64,
    }

    /// === Initial ===
    // TODO: Create insta_management shared object.
    fun init(witness: INSTA_MANAGEMENT, ctx: &mut TxContext) {
        let creatorCap = CreatorCap {
            id: object::new(ctx),
        };
        let instaConfig = InstaConfig {
            id: object::new(ctx),
            isInited: true,
            creator: tx_context::sender(ctx),
            is_request_withdraw: false,
            is_freezed: false,
            rate_limit_per_hour: 100,
            version: 0,
            // Minimum gas fee allow.
            minimum_gas: 0,
            pre_paid_supply: balance::zero<SUI>(),
            redeem_gas_fee:balance::zero<SUI>(),
        };
        // * A least gas fee. Free to change or remove.
        setting_minimum(&mut instaConfig, &creatorCap, 100_000);
        transfer::transfer(
            creatorCap,
            tx_context::sender(ctx)
        );
        transfer::share_object(instaConfig);
    }
    /// === Creator/Owner Operation ===
    // TODO: Register an account for deposit and mint NFT.
    public entry fun authorize_insta_signer(instaConfig: &mut InstaConfig, _creatorCap: &CreatorCap, insta_signer: address, need_increase_version: bool, ctx: &mut TxContext) {
        if(need_increase_version){
            instaConfig.version = instaConfig.version + 1;
        };
        transfer::transfer(
            SignerCap {
                id: object::new(ctx),
                version: instaConfig.version,
                deposit: Deposited {id : object::new(ctx),  pre_paid: 0},
            }, 
            insta_signer
        );
    }
    // TODO: Setting minimum_gas per mint.
    public entry fun setting_minimum(instaConfig: &mut InstaConfig, _creatorCap: &CreatorCap, amount: u64){
        instaConfig.minimum_gas = amount;
    }
    // TODO: Record the deposit into insta_management.
    public entry fun owner_add_deposit(instaConfig: &mut InstaConfig, _creatorCap: &CreatorCap, coin: Coin<SUI>, ctx: &mut TxContext){
        let amount = coin::value<SUI>(&coin);
        add_pre_paid(instaConfig, coin, ctx);
    }
    // TODO: Withdraw redeem's gas fee from insta_management.
    public entry fun withdraw_gas_fee_from_redeem(instaConfig: &mut InstaConfig, _creatorCap: &CreatorCap, amount: u64, ctx:&mut TxContext){
        let insta_balance = balance::split(&mut instaConfig.redeem_gas_fee,amount);
        let coin = coin::from_balance<SUI>(
            insta_balance,
            ctx
        );
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }
    /// === Signer Operation ===
    // TODO: Record the deposit into signer_cap.
    public entry fun add_deposit(instaConfig: &mut InstaConfig, signerCap: &mut SignerCap, coin: Coin<SUI>, ctx: &mut TxContext){
        let amount = coin::value<SUI>(&coin);
        signerCap.deposit.pre_paid = signerCap.deposit.pre_paid + amount;
        add_pre_paid(instaConfig, coin, ctx);
    }
    // TODO: Deposit the pre-paid into insta_management.
    fun add_pre_paid (instaConfig: &mut InstaConfig, coin: Coin<SUI>, ctx: &mut TxContext){
        balance::join(
            &mut instaConfig.pre_paid_supply,
            coin::into_balance(coin),
        );
    }
    // TODO: Record the withdraw from signer_cap.
    fun withdraw_paid(instaConfig: &mut InstaConfig, signerCap: &mut SignerCap, amount: u64){
        signerCap.deposit.pre_paid = signerCap.deposit.pre_paid - amount;
        withdraw_pre_paid(instaConfig, amount);
    }
    // TODO: Signer withdraw pre-paid from insta_management.
    fun withdraw_pre_paid(instaConfig: &mut InstaConfig, amount:u64){
        let insta_balance = balance::split(&mut instaConfig.pre_paid_supply,amount);
        balance::join(&mut instaConfig.redeem_gas_fee, insta_balance);
    }

    public entry fun mint(
        instaConfig: &mut InstaConfig,
        _signerCap: &mut SignerCap, 
        name: vector<u8>,
        description: vector<u8>,
        img_url: vector<u8>,
        _gas_fee: u64,
        ctx: &mut TxContext
    ) {
        assert!(_signerCap.version == instaConfig.version, 0);
        assert!(instaConfig.is_freezed == false, 0);
        assert!(_signerCap.deposit.pre_paid < _gas_fee, ENotAllow);
        assert!(_signerCap.deposit.pre_paid < instaConfig.minimum_gas, ENotEnough);
        if(instaConfig.is_request_withdraw&& _gas_fee > 0){
            // TODO: Process Withdraw
            withdraw_paid(instaConfig, _signerCap, _gas_fee);
        };
        insta_nft::mint(
            name,
            description,
            img_url,
            instaConfig.creator,
            ctx
        );
        //TODO: process payment <- via Sponsored transaction
        
    }

}
