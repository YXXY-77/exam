const SID = "12403030215";
const examDB = db.getSiblingDB("exam_" + SID);
examDB.courses.deleteMany({});
examDB.courses.insertMany([
  {
    _id: "COURSE-" + SID + "-01",
    title: "NoSQL数据库",
    teacher: "张老师",
    status: "OPEN",
    chapters: [
      { chapterId: "CH01", title: "MongoDB基础", hours: 2 },
      { chapterId: "CH02", title: "Redis基础", hours: 2 }
    ]
  },
  {
    _id: "COURSE-" + SID + "-02",
    title: "数据库原理",
    teacher: "张老师",
    status: "CLOSED",
    chapters: [
      { chapterId: "CH01", title: "关系模型", hours: 2 }
    ]
  },
  {
    _id: "COURSE-" + SID + "-03",
    title: "机器学习",
    teacher: "李老师",
    status: "OPEN",
    chapters: [
      { chapterId: "CH01", title: "分类", hours: 2 },
      { chapterId: "CH02", title: "聚类", hours: 2 }
    ]
  }
]);

（1）
const SID = "12403030215";
const examDB = db.getSiblingDB("exam_" + SID);
examDB.courses.aggregate([
  {$match: {teacher:"张老师", status:"OPEN"}},
  {$project:{
      _id:1,
      title:1,
      chapterCount: {$size:"$chapters"}
  }}
])

（2）
const SID = "12403030215";
const examDB = db.getSiblingDB("exam_" + SID);
const S=15;
examDB.courses.updateOne(
  {_id:"COURSE-"+SID+"-01"},
  {$set:{"chapters.$[elem].title":"Redis基础与应用-"+S}},
  {arrayFilters:[{"elem.chapterId":"CH02"}]}
);
//查看更新后文档
examDB.courses.findOne({_id:"COURSE-"+SID+"-01"})

（3）
const SID = "12403030215";
const examDB = db.getSiblingDB("exam_" + SID);
const A=0;
//执行第1次
examDB.courses.updateOne(
  {_id:"COURSE-"+SID+"-01"},
  {$addToSet:{
      chapters:{chapterId:"CH03", title:"Redis高级操作", hours:2+A}
  }}
);
//执行第2次（重复执行，不会新增）
examDB.courses.updateOne(
  {_id:"COURSE-"+SID+"-01"},
  {$addToSet:{
      chapters:{chapterId:"CH03", title:"Redis高级操作", hours:2+A}
  }}
);

（4）
const SID = "12403030215";
const examDB = db.getSiblingDB("exam_" + SID);
let course = examDB.courses.findOne({_id:"COURSE-"+SID+"-01"});
//(1)CH02标题
let ch02 = course.chapters.find(x=>x.chapterId==="CH02");
printjson("CH02标题："+ch02.title);
//(2)CH03数量
let ch03Arr = course.chapters.filter(x=>x.chapterId==="CH03");
printjson("CH03数量："+ch03Arr.length);
//(3)总章节数
printjson("最终章节总数："+course.chapters.length);
//(4)teacher、status原值
printjson("teacher原值："+course.teacher+"，status原值："+course.status);
CH02标题：Redis基础与应用-15
CH03数量：1
最终章节总数：3
teacher原值：张老师，status原值：OPEN
const SID="12403030215";
const examDB = db.getSiblingDB("exam_"+SID);
//重置集合
examDB.inventory.deleteMany({});
examDB.orders.deleteMany({});
examDB.inventory.insertOne({
    _id:"BOOK-"+SID,
    title:"NoSQL数据库教材",
    stock:5
});