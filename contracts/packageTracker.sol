pragma solidity ^0.4.18;

contract packageTracker {
    
    constructor() public {}
    
    //Danh sách các biến
    struct member {
        string typeMember; //1. loại thành viên: Nhà sản xuất, người tiêu dùng, vận chuyển,... 
        string nameMember; //2. tên thành viên
        string infoName; //3. miêu tả thành viên
        uint countPackOwner; //4. số pack đang sở hữu
        uint countPackLogistic; //5. số pack đang lưu trữ hoặc vận chuyển
        bool isMember; //6. true nếu là thành viên trong danh sách
    }
    struct sensor {
        uint sId; //mã cảm biến
        string infoSensor; //thông tin cảm biến
        bool isSensor; //true nếu là cảm biến trong danh sách
    }
    struct package {
        address owner; //1. địa chỉ chủ sở hữu
        address ofSensor; //2. địa chỉ cảm biến đặt trong gói hàng
        address logictis; //3. địa chỉ đơn vị lưu trữ, vận chuyển
        string namePack; //4. tên gói hàng
        string infoPack; //5. thông tin gói hàng
        uint countState; //6. đếm số trạng thái đã qua
        uint countEvents; //7. đếm số lượng sự kiện
        bool checkPack; //8. true nếu được kiểm tra Ok
        bool isReal; //9. true nếu hàng nằm trong danh sách, hàng thật
    }
    struct track {
        uint pIdTrack; //mã hàng hóa được track
        string typeEnvoriment; //kiểu môi trường đo: nhiệt độ, độ ẩm
        uint valueEnvoriment; //giá trị môi trường
        int long; //Vị trí kinh độ xảy ra sự kiện
        int lat; //Vị trí vĩ độ xảy ra sự kiện
        //uint timeStamp; //Thời gian xảy ra sự kiện sử dụng now or block.timestamp; cảnh báo bảo mật
        uint blockNumber; //vị trí Block sự kiện được ghi lại
        address tracker; //địa chỉ người gửi sự kiện
    }

    struct state {
        uint pIdstate; //mã hàng hóa trạng thái
        string statePack; //trạng thái
        uint blockStart; //thời gian bắt đầu trạng thái
        uint blockEnd; //thời gian kết thúc trạng thái
        address getterState; //địa chỉ người tạo trạng thái
    }

    mapping (address => member) public memberList; //List các thành viên
    uint memberCounter;
    mapping (address => sensor) public sensorList; //List các cảm biến
    uint sensorCounter;
    mapping (uint => package) public packageList; //List các hàng hóa
    uint packageCounter; 
    mapping (uint => mapping(address => uint)) public packOfOwnerList; //List các hàng hóa thuộc chủ sở hữu
    uint packOfOwnerCounter;
    mapping (uint => track) public eventList; //List các sự kiện
    uint eventCounter; 
    mapping (uint => state) public stateList; //List các sự kiện
    uint stateCounter;

    // Danh sách các event hệ thống
    event create_package (address _ower, string _namePack, string _infoPack);
    event transport_package (address _ower, address _logictis, string _namePack, string _message);
    event sell_package (address _ower, string _namePack, string _message);

    // Danh sách các hàm
    function createMember(address _addrMember, string _typeMember, string _nameMember, string _infoMember) public {
        require(memberList[_addrMember].isMember != true, "Thành viên này đã tồn tại");
        memberCounter ++;
        memberList[_addrMember] = member(_typeMember, _nameMember, _infoMember, uint(0), uint(0), true);
    }

    function deleteMember(address _addrMember) public {
        require(memberList[_addrMember].isMember == true, "Thành viên chưa tồn tại");
        memberCounter --;
        delete memberList[_addrMember];
    }

    function getNumberOfMember() public view returns (uint) {
        return memberCounter;
    }

    function createSensor(address _addrSensor, uint _sId, string _infoSensor) public {
        require(sensorList[_addrSensor].isSensor != true, "Sensor này đã tồn tại");
        sensorCounter ++;
        sensorList[_addrSensor] = sensor(_sId, _infoSensor, true);
    }

    function deleteSensor(address _addrSensor) public {
        require(memberList[_addrSensor].isMember == true, "Sensor chưa tồn tại");
        sensorCounter --;
        delete sensorList[_addrSensor];
    }

    function getNumberOfSensor() public view returns (uint) {
        return sensorCounter;
    }

    function createPackage(uint _pId, string _namePack, string _infoPack) public {
        require(packageList[_pId].isReal != true, "Mã hàng hóa là duy nhất");
        packageCounter ++;
        packageList[_pId] = package(msg.sender, 0x0, 0x0, _namePack, _infoPack, uint(1), uint(1), true, true);
        stateCounter ++;
        stateList[stateCounter] = state(_pId, "Khởi tạo", block.number, 0x0, msg.sender);
        memberList[msg.sender].countPackOwner ++;
        packOfOwnerList[packOfOwnerCounter][msg.sender] = _pId;
        packOfOwnerCounter++;
    }

    function getPackOfOwner(address _mId) public view returns (uint[]) {
        uint counter = memberList[_mId].countPackOwner; 
        uint[] memory packs = new uint[](counter);
        uint j = 0;
        for(uint i = 0; i < packOfOwnerCounter; i++) {
            if(packOfOwnerList[i][_mId] != 0x0) {
                packs[j] = packOfOwnerList[i][_mId];
                j++;
            }
        }
        return packs;
    }

    function getNumberOfPackage() public view returns (uint) {
        return packageCounter;
    }

    function createEvent(uint _pIdTrack, string _typeEnv, uint _valueEnv, int _long, int _lat) public {
        eventCounter ++;
        eventList[eventCounter] = track(_pIdTrack, _typeEnv, _valueEnv, _long, _lat, block.number, msg.sender);
        packageList[_pIdTrack].countEvents ++;
    }

    function getEventsOfPack(uint _pId) public view returns (uint[]) {
        uint counter = packageList[_pId].countEvents; 
        uint[] memory events = new uint[](counter);
        uint numberOfEvents = 0;
        for (uint i = 0; i <= eventCounter; i++) {
            if(eventList[i].pIdTrack == _pId) {
                events[numberOfEvents] = i;
                numberOfEvents++;
            }
        }
        return events;
    }

    function getTotalOfEvent() public view returns (uint) {
        return eventCounter;
    }

    function changeState(uint _pIdState, string _state) public {
        require(memberList[msg.sender].isMember == true, "Chỉ thành viên");

        stateCounter ++;
        uint last = packageList[_pIdState].countState - 1;
        uint[] memory statesOfPack = getStatesOfPack(_pIdState);
        stateList[statesOfPack[last]].blockEnd = block.number; 
        stateList[stateCounter] = state(_pIdState, _state, block.number, 0x0, msg.sender);
        packageList[_pIdState].countState ++;
    }

    function getStatesOfPack(uint _pId) public view returns (uint[]) {
        uint counter = packageList[_pId].countState; 
        uint[] memory states = new uint[](counter);
        uint numberOfStates = 0;
        for (uint i = 0; i <= stateCounter; i++) {
            if(stateList[i].pIdstate == _pId ) {
                states[numberOfStates] = i;
                numberOfStates++;
            }
        }
        return states;
    }

    function getLastState(uint _pId) public view returns (uint) {
        uint lastState = packageList[_pId].countState - 1;
        uint[] memory statesOfPack = getStatesOfPack(_pId);

        return statesOfPack[lastState];
        
    }
    function getTotalOfState() public view returns (uint) {
        return stateCounter;
    }

    function changeOwner(address _toOwner, uint _pid) public {
        require(packageList[_pid].owner == msg.sender, "Chỉ chủ sở hữu mới được đổi");
        require(memberList[msg.sender].isMember == true, "Chỉ chuyển đến thành viên");
        packageList[_pid].owner = _toOwner;
    }

    function changeSensor(address _toSensor, uint _pid) public {
        require(packageList[_pid].owner == msg.sender, "Chỉ chủ sở hữu mới được đổi");
        require(sensorList[_toSensor].isSensor == true, "Chỉ đổi cảm biến trong danh sách");
        packageList[_pid].ofSensor = _toSensor;
    }

    function changeLogictis(address _toLogictis, uint _pid) public {
        require(packageList[_pid].owner == msg.sender || packageList[_pid].logictis == msg.sender, "Không có quyền đổi");
        require(memberList[msg.sender].isMember == true, "Chỉ chuyển đến thành viên");
        packageList[_pid].owner = _toLogictis;
    }

    function checkPackage(uint _pId, bool _check, string _message) public {
        require(memberList[msg.sender].isMember == true, "Chỉ thành viên mới được check");
        packageList[_pId].checkPack = _check;
        changeState(_pId, _message);      
    }

}