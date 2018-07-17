var packageTracker = artifacts.require("./packageTracker.sol");

// test suite
contract('packageTracker', function(accounts){

    var a = 4;
    var b;

    it("kiểm tra chức năng tạo mapping", function() {
        return packageTracker.deployed().then(function(instance) {
            pack = instance;
            pack.createMember(accounts[0], "Nhà sản xuất", "Công ty dược Trung Thành", "Nam Định");
            pack.createMember(accounts[1], "Nhà vận chuyển", "Công ty dược Trung Dũng", "Hà Nam");
            pack.createMember(accounts[2], "Cảm biến", "Công ty dược Trung Kiên", "Ninh Bình");
            return pack.createMember(accounts[3], "Nhà bán hàng", "Công ty dược Trung Nghĩa", "Thái Bình");
        }).then(function() {
            return pack.getNumberOfMember();
        }).then(function(data){
            console.log("Số thành viên là:", data.toNumber());
            //assert.equal(data.toString(), "4", "kết quả đúng");
            return pack.memberList(accounts[1]);
        }).then(function(data) {
            console.log("Dữ liệu thành viên 1:",data[0], data[1], data[2]);
            pack.createPackage(123, "Thuốc", "Hà Nội");
            pack.createPackage(124, "Vải", "Hải Phòng");
            return pack.createPackage(125, "Quần", "Quảng Ninh");
        }).then(function(){
            return pack.packageList(123);
        }).then(function(data) {
            console.log("Chủ sở hữu hàng hóa 1:", data[0]);
            return pack.changeOwner(accounts[1], 123);
        }).then(function(){
            return pack.packageList(123);
        }).then(function(result) {
            console.log("Chủ sở hữu hàng hóa 1:", 
                        result[0],
                        result[1],
                        result[2],
                        result[3],
                        result[4],
                        result[5].toNumber(),
                        result[6].toNumber(),
                        result[7],
                        result[8],    
                        );
            return pack.getNumberOfPackage();
        }).then(function (data) {
            console.log("Số hàng hóa là:", data.toNumber());   
            pack.changeState(123, "đang kiểm tra");
            pack.changeState(124, "đã kiểm tra");
            return pack.changeState(125, "đang kiểm tra");   
        }).then(function () {
            return pack.packageList(123);
        }).then(function (result) {
            console.log("Chủ sở hữu hàng hóa 1:", result[0], result[5].toNumber(), result[6].toNumber());
            return pack.getTotalOfState();
        }).then(function (data) {
            // for(var i = 0; i < data.length; i++) {
            //     console.log("Trạng thái ", i, " là:", data[i].toNumber());
            // }
           // stateOfPack = data[1];   
            console.log("Tổng số sự kiện là", data.toNumber());
            return pack.stateList(a);     
        }).then(function (result) {
            console.log("Đang test trạng thái thứ ", a," là:", result[0].toNumber(), result[1].toString(), result[2].toString(), result[3].toString());
            b = result[0].toNumber();
            return pack.getLastState(b);
        }).then(function (data) {
            console.log("1 - Trạng thái hiện tại của pack", b, " là:", data.toNumber());
            return pack.stateList(data);
        }).then(function (result) {
            console.log("1 - Trạng thái đang kiểm tra là:", result[0].toNumber(), result[1].toString(), result[2].toString(), result[3].toString());
            return pack.checkPackage(b, true, "Còn vài điểm cần bổ sung");
        }).then(function() {
            return pack.getLastState(b);
        }).then(function (data) {
            console.log("2 - Trạng thái hiện tại của pack", b, " là:", data.toNumber());
            return pack.stateList(data);
        }).then(function (result) {
            console.log("2 - Trạng thái đang kiểm tra là:", result[0].toNumber(), result[1].toString(), result[2].toString(), result[3].toString());
        });
    })
})