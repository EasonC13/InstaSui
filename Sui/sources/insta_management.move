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

    /// A least gas fee.
    const Minimum_gas: u64 = 100_000;

    /// Trying to withdraw higher   pre_paid than stored.
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
        pre_paid_supply: Balance<SUI>,
    }
    // TODO: Deposit
    struct Deposited has key, store {
        id: UID,
        pre_paid: u64,
    }
    fun init(witness: INSTA_MANAGEMENT, ctx: &mut TxContext) {
        transfer::transfer(
            CreatorCap {
                id: object::new(ctx),
                }, 
            tx_context::sender(ctx)
        );
        let instaConfig = InstaConfig {
            id: object::new(ctx),
            isInited: true,
            creator: tx_context::sender(ctx),
            is_request_withdraw: false,
            is_freezed: false,
            rate_limit_per_hour: 100,
            version: 0,
            pre_paid_supply: balance::zero<SUI>(),
        };
        transfer::share_object(instaConfig);
    }
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

    fun add_pre_paid (instaConfig: InstaConfig, coin: Coin<SUI>, ctx: &mut TxContext){
        balance::join(
            &mut instaConfig.pre_paid_supply,
            coin::into_balance(coin),
        );
    }

    public entry fun add_deposit(instaConfig: InstaConfig, signerCap: &mut SignerCap, coin: Coin<SUI>, ctx: &mut TxContext){
        let amount = coin::value<SUI>(&coin);
        signerCap.deposit.pre_paid = signerCap.deposit.pre_paid + amount;
        add_pre_paid(instaConfig, coin, ctx);
    }

    fun withdraw_pre_paid(instaConfig: InstaConfig, amount:u64, ctx: &mut TxContext){
        let insta_balance = balance::split(&mut instaConfig.pre_paid_supply,amount);
        let coin = coin::from_balance(insta_balance, ctx);
    }

    public entry fun withdraw_paid(instaConfig: InstaConfig, signerCap: &mut SignerCap, amount: u64, ctx: &mut TxContext){
        signerCap.deposit.pre_paid = signerCap.deposit.pre_paid - amount;
        withdraw_pre_paid(instaConfig, amount, ctx);
    }


    public entry fun mint(
        instaConfig: &InstaConfig,
        _signerCap: &SignerCap, 
        name: vector<u8>,
        description: vector<u8>,
        img_url: vector<u8>,
        _gas_fee: u64,
        ctx: &mut TxContext
    ) {
        assert!(_signerCap.version == instaConfig.version, 0);
        assert!(instaConfig.is_freezed == false, 0);
        assert!(_signerCap.deposit.pre_paid < Minimum_gas, ENotEnough);
        if(instaConfig.is_request_withdraw&& _gas_fee > 0){
            // TODO: Process Withdraw

        };
        insta_nft::mint(
            name,
            description,
            img_url,
            instaConfig.creator,
            ctx
        );
        //TODO: process payment
        
    }

}
