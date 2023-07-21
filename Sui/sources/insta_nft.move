module insta::insta_nft {
    #[test_only]
    friend insta::insta_nftTests;
    
    friend insta::insta_management;
    use sui::url::{Self, Url};
    use std::string;
    use std::string::utf8;
    use sui::package;
    use sui::display;
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// An example NFT that can be minted by anybody
    struct InstaNFT has key, store {
        id: UID,
        /// Name for the token
        name: string::String,
        /// Description of the token
        description: string::String,
        /// URL for the token
        img_url: Url,
        creator: address,
    }

    struct MintNFTEvent has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
        // The creator of the NFT
        creator: address,
        // The name of the NFT
        name: string::String,
    }
    struct INSTA_NFT has drop {}
    const NAME: vector<u8> = b"Insta NFT";
    const IMAGE_URL: vector<u8> = b"https://i.imgur.com/92pLUId.jpg";
    const DESCRIPTION: vector<u8> = b"Easily Create Sui NFT by InstaSui Chatbot";
    const OFFICIAL_URL: vector<u8> = b"https://t.me/InstaSuiBot";
    const CREATOR: vector<u8> = b"@InstaSuiBot";

    fun init(otw: INSTA_NFT, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];

        let values = vector[
            utf8(NAME),
            utf8(IMAGE_URL),
            utf8(DESCRIPTION),
            utf8(OFFICIAL_URL),
            utf8(CREATOR),
        ];

        let publisher = package::claim(otw, ctx);
        let display = display::new_with_fields<InstaNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        let deployer = tx_context::sender(ctx);
        transfer::public_transfer(publisher, deployer);
        transfer::public_transfer(display, deployer);
    }

    /// Create a new insta_nft
    public(friend) fun mint(
        name: vector<u8>,
        description: vector<u8>,
        img_url: vector<u8>,
        creator: address,
        ctx: &mut TxContext
    ) {
        let nft = InstaNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            img_url: url::new_unsafe_from_bytes(img_url),
            creator: creator
        };
        
        event::emit(MintNFTEvent {
            object_id: object::uid_to_inner(&nft.id),
            creator: creator,
            name: nft.name,
        });
        transfer::public_transfer(nft, creator);
    }

    /// Update the `description` of `nft` to `new_description`
    public(friend) fun update_description(
        nft: &mut InstaNFT,
        new_description: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(nft.creator == tx_context::sender(ctx), 0);
        nft.description = string::utf8(new_description);
    }
    /// Update the `description` of `nft` to `new_description`
    public(friend) fun update_name(
        nft: &mut InstaNFT,
        new_description: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(nft.creator == tx_context::sender(ctx), 0);
        nft.name = string::utf8(new_description);
    }

    /// Permanently delete `nft`
    public(friend) fun burn(nft: InstaNFT) {
        let InstaNFT { id, name: _, description: _, img_url: _, creator: _ } = nft;
        object::delete(id)
    }

    /// Get the NFT's `name`
    public fun name(nft: &InstaNFT): &string::String {
        &nft.name
    }

    /// Get the NFT's `description`
    public fun description(nft: &InstaNFT): &string::String {
        &nft.description
    }

    /// Get the NFT's `url`
    public fun img_url(nft: &InstaNFT): &Url {
        &nft.img_url
    }
}

#[test_only]
module insta::insta_nftTests {
    use insta::insta_nft::{Self, InstaNFT};
    use sui::test_scenario as ts;
    use sui::transfer;
    use std::string;

    #[test]
    fun mint_transfer_update() {
        let addr1 = @0xA;
        let addr2 = @0xB;
        // create the NFT
        let scenario = ts::begin(addr1);
        {
            insta_nft::mint(b"test", b"a test", b"https://www.sui.io", addr1, ts::ctx(&mut scenario))
        };
        ts::next_tx(&mut scenario, addr1);
        {
            let nft = ts::take_from_sender<InstaNFT>(&mut scenario);
            insta_nft::update_description(&mut nft, b"a new description", ts::ctx(&mut scenario)) ;
            assert!(*string::bytes(insta_nft::description(&nft)) == b"a new description", 0);
            insta_nft::update_name(&mut nft, b"a new name", ts::ctx(&mut scenario)) ;
            assert!(*string::bytes(insta_nft::name(&nft)) == b"a new name", 0);
            ts::return_to_sender(&mut scenario, nft);
        };
        // send it from A to B
        ts::next_tx(&mut scenario, addr1);
        {
            let nft = ts::take_from_sender<InstaNFT>(&mut scenario);
            transfer::public_transfer(nft, addr2);
        };
        // update its description
        
        // burn it
        ts::next_tx(&mut scenario, addr2);
        {
            let nft = ts::take_from_sender<InstaNFT>(&mut scenario);
            insta_nft::burn(nft)
        };
        ts::end(scenario);
    }
}
