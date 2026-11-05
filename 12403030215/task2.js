（1）
const SID="12403030215";
const Buy=1;
let res = examDB.inventory.updateOne(
  {
    _id:"BOOK-"+SID,
    stock:{$gte: Buy}
  },
  {$inc:{stock:-Buy}}
);
// res.modifiedCount ===1 扣减成功；0代表库存不足/文档不存在
const SID="12403030215";
const Buy=1;
let res = examDB.inventory.updateOne(
  {
    _id:"BOOK-"+SID,
    stock:{$gte: Buy}
  },
  {$inc:{stock:-Buy}}
);
// res.modifiedCount ===1 扣减成功；0代表库存不足/文档不存在

（2）
const SID="12403030215";
//清空库存、订单
examDB.inventory.deleteMany({});
examDB.orders.deleteMany({});
//重建原始库存文档
examDB.inventory.insertOne({
    _id:"BOOK-"+SID,
    title:"NoSQL数据库教材",
    stock:5
});
printjson(examDB.inventory.findOne({_id:"BOOK-"+SID}));
print("订单集合文档数量："+examDB.orders.countDocuments());

（3）
// 给订单集合建立唯一索引（requestId防重复下单）
db.orders.createIndex({requestId:1}, {unique:true});

// 重置函数
function reset(initStock) {
    db.inventory.deleteMany({});
    db.orders.deleteMany({});
    db.inventory.insertOne({stock: initStock});
}

// 查询状态
function getState() {
    let inv = db.inventory.findOne();
    let st = inv ? inv.stock : 0;
    let ordCnt = db.orders.countDocuments({});
    return [st, ordCnt];
}

// 下单函数
function buy(requestId, buyNum, forceError=false) {
    const session = db.getMongo().startSession();
    session.startTransaction({
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
    });
    try {
        let updateRes = db.inventory.updateOne(
            {stock: {$gte: buyNum}},
            {$inc: {stock: -buyNum}},
            {session: session}
        );
        if (updateRes.modifiedCount === 0) {
            session.abortTransaction();
            session.endSession();
            return false;
        }

        if (forceError) {
            throw new Error("模拟中途异常");
        }

        db.orders.insertOne(
            {requestId: requestId, buy_num: buyNum},
            {session: session}
        );
        session.commitTransaction();
        session.endSession();
        return true;
    } catch(e) {
        session.abortTransaction();
        session.endSession();
        return false;
    }
}

// 运行测试场景函数
function runCase(name, initStock, buyNum, forceError=false, times=1) {
    reset(initStock);
    let succ = 0, fail = 0;
    for(let i=0; i<times; i++){
        let rid = name + "_" + i;
        let ok = buy(rid, buyNum, forceError);
        if(ok) succ++; else fail++;
    }
    let [finalStock, finalOrdCnt] = getState();

    let expectOk, expectStock;
    if(forceError) {
        expectOk = 0;
        expectStock = initStock;
    } else {
        let maxBuy = Math.floor(initStock / buyNum);
        expectOk = Math.min(times, maxBuy);
        expectStock = initStock - expectOk * buyNum;
    }
    let expectOrd = expectOk;
    let pass = (succ === expectOk && finalStock === expectStock && finalOrdCnt === expectOrd);

    print("========================================");
    print("场景编号：" + name);
    print("初始库存：" + initStock);
    print("单次购买数量：" + buyNum);
    print("成功次数：" + succ);
    print("失败次数：" + fail);
    print("最终库存：" + finalStock);
    print("最终订单数量：" + finalOrdCnt);
    print("是否通过核验：" + pass);
    return pass;
}
