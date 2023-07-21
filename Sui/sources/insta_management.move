module insta::insta_management {
    use insta::insta_nft;
    use sui::url::{Self, Url};
    use std::string;
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    struct INSTA_MANAGEMENT has drop {}

    struct CreatorCap has key {
        id: UID,
    }
    struct SignerCap has key {
        id: UID,
        version: u64,
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
    // TODO: Deposit
    struct Deposited has key {
        id: UID,
        amount: u64,
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
                version: instaConfig.version
            }, 
            insta_signer
        );
    }

    public entry fun add_deposit(){

    }

    public entry fun mint(
        instaConfig: &InstaConfig,
        _signerCap: &SignerCap, 
        name: vector<u8>,
        description: vector<u8>,
        img_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(_signerCap.version == instaConfig.version, 0);
        assert!(instaConfig.is_freezed == false, 0);
        if(instaConfig.is_request_withdraw){
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
    // public entry fun mint_test(
    //     ctx: &mut TxContext
    // ) {
    //     insta_nft::mint(
    //         b"Insta NFT",
    //         b"Insta NFT",
    //         b"https://thispersondoesnotexist.com",
    //         tx_context::sender(ctx),
    //         ctx
    //     );
    //     //TODO: process payment
    // }
}
