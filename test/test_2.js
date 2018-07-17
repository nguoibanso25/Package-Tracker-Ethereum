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
            return pack.getPackOfOwner(accounts[0]);
        }).then(function (result) {
            if(result.length != 0) {
                console.log("Danh sách tài sản:");
                for(var i = 0; i < result.length; i++) {
                    packageTracker.deployed().then(function(instance) {
                        return pack.packageList(result[i]);
                    }).then(function(data) {
                        console.log(data[3]);
                    });
                }
            } else {
                console.log("Không có tài sản");
            }    
        });
    })
})