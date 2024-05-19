pragma solidity ^0.8.0;

contract Audilab {
    address payable public owner;
    struct Audio {
        string artist;
        string name;
        string description;
        uint price;
        string coverImage;
        string audioFile;
        string audioTrialFile;
        uint reward;
        address payable uploader;
    }

    struct User {
        string name;
        uint[] purchase;
        bool set;
    }

    mapping(address => User) users;
    Audio[] public audio_uploaded;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can access this");
        _;
    }

    constructor(){
        owner = payable(msg.sender);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function deposit() public payable {
    }

    function createUser(string memory _userName) public {
        User storage user = users[msg.sender];
        // Check that the user did not already exist:
        require(!user.set);
        //Store the user
        /*
        users[msg.sender].name = _userName;
        users[msg.sender].set = true;
        users[msg.sender].purchase = emptyArray;
        */
        uint[] memory emptyArray; //a temperary array of unsign integer

        users[msg.sender] = User({
            purchase: emptyArray,
            name: _userName,
            set: true
        });
        
    }
    
    function getUser(address user) public view returns (bool, string memory, uint[] memory) {
        return (users[user].set, users[user].name, users[user].purchase);
    }
    function purchase(uint audioIndex) public payable returns (bool){
        require(msg.value == audio_uploaded[audioIndex].price);
        User storage user = users[msg.sender];
        // Check that the user did not already exist:
        require(user.set);
        require(audio_uploaded[audioIndex].price > 0);
        // send audio_uploaded[audioIndex].price to audio_uploaded[audioIndex].uploader address
        payable(audio_uploaded[audioIndex].uploader).transfer(audio_uploaded[audioIndex].price);
        // send reward in native token, (replaced by eth for demo purposes)
        audio_uploaded[audioIndex].reward += 0.1 ether;
        // check the purchase succeeded
        // append to purchase list
        users[msg.sender].purchase.push(audioIndex);
        return true;
    }

    // set owner
    // send from owner wallet

    function storeMusic(string memory _artist, string memory _name, string memory _desc, uint _price, string memory _cover, string memory _audioFile, string memory _audioTrialFile) public {
        Audio memory new_audio = Audio(_artist, _name, _desc, _price, _cover, _audioFile,_audioTrialFile,  0, payable(msg.sender));
        audio_uploaded.push(new_audio);
    }
    function updatePrice(uint toAudio) public{
        // check if the music owner equal to , or the owner equal to
        require(audio_uploaded[toAudio].uploader == msg.sender );
        audio_uploaded[toAudio].price += 1 ether;
	}
    function updatePrice1(uint toAudio,uint _price) public{
        // check if the music owner equal to , or the owner equal to
        require(audio_uploaded[toAudio].uploader == msg.sender );
     	audio_uploaded[toAudio].price = _price;
	}
    function getAudioCount() public view returns (uint){
        return audio_uploaded.length;
    }
    function checkPurchased(address userAddr,uint audioIndex ) public view returns (bool, uint){
        User storage user = users[userAddr];
        bool exist = false;
        for(uint i=0; i<user.purchase.length;i++) {
            if(user.purchase[i] == audioIndex){
                exist = true;
            }
        }
        return (exist, audioIndex);
    }
    function getAudio(uint index) public view returns (uint, string memory, string memory, uint, string memory, string memory, address){
        //User storage user = users[msg.sender];
        string memory audioFile = audio_uploaded[index].audioFile;
        string memory trial = audio_uploaded[index].audioTrialFile;
        string memory artist = audio_uploaded[index].artist;
        string memory name = audio_uploaded[index].name;
        string memory coverImg = audio_uploaded[index].coverImage;
        uint price = audio_uploaded[index].price;
        address uploader = audio_uploaded[index].uploader;
        // Check if the user already purchased the content
        /*if(audio_uploaded[index].uploader == msg.sender){
            for (uint prop =0; prop < proposals.length; prop++) //search for the highest voted proposals 
                if (proposals[prop].voteCount > winningVoteCount) {
                    winningVoteCount = proposals[prop].voteCount;
                    propsalsIndex = prop;
                    }
            assert(winningVoteCount > 0); //
            _winningProposal = propsalsIndex;   //what if  there is a tie? it will only return the first winner but not all winners!!!!
            }
        }else{
            string memory audioFile = audio_uploaded[index].audioFile;
        }*/
        return (
            index,
            artist, 
            name, 
            price, 
            coverImg, 
            audioFile, 
            //trial, 
            uploader
        );
    }
    
    function claimReward(uint toAudio) public returns(bool) {
        require(audio_uploaded[toAudio].reward <= address(this).balance);
        //payable(msg.sender).transfer(audio_uploaded[toAudio].reward);
        payable(msg.sender).transfer(audio_uploaded[toAudio].reward);
        //owner.transfer(audio_uploaded[toAudio].reward);
        audio_uploaded[toAudio].reward = 0;
        return true;
    }
    // purchase
    function sizeOfArray() public view returns (uint sizeA) {
     sizeA = audio_uploaded.length;
    }
    /*function setPrice(uint p) public {
        price = p;
    }*/

}
