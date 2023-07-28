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
    }
    struct Deposited has key, store {
        id: UID,
        pre_paid: Balance<SUI>,
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
        };
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
                deposit: Deposited {id : object::new(ctx),  pre_paid: balance::zero()},
            }, 
            insta_signer
        );
    }
    /// === Signer Operation ===
    // TODO: Record the deposit into signer_cap.
    public entry fun add_deposit(signerCap: &mut SignerCap, coin: Coin<SUI>){
        balance::join(
            &mut signerCap.deposit.pre_paid,
            coin::into_balance(coin)
        );
    }
    // TODO: Record the withdraw from signer_cap.
    fun withdraw_paid(signerCap: &mut SignerCap, amount: u64, ctx: &mut TxContext): Coin<SUI>{
        let balance = balance::split(
            &mut signerCap.deposit.pre_paid,
            amount
        );
        coin::from_balance(
            balance,
            ctx
        )
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
        assert!(
            balance::value(&_signerCap.deposit.pre_paid) < _gas_fee,
            ENotAllow
        );
        if(instaConfig.is_request_withdraw&& _gas_fee > 0){
            // TODO: Process Withdraw
            let coin = withdraw_paid(_signerCap, _gas_fee, ctx);
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
