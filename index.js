const DynamoDB=require("aws-sdk/clients/dynamodb")
const DocumentClient= new DynamoDB.DocumentClient({region:"us-east-1"})
const NOTES_TABLE_NAME=process.env.NOTES_TABLE_NAME

const Send=(statusCode,data)=>{
  return{
    statusCode,
    body: JSON.stringify(data)
  }
}

module.exports.createNotes = async (event,context,cb) => {

  let data=JSON.parse(event.body)

  try{
let params={
  TableName: NOTES_TABLE_NAME,
  Item:{
    notesId:data.id,
    title:data.title,
    body:data.body
  },
  ConditionExpression: "attribute_not_exists(notesId)"
}
  await DocumentClient.put(params).promise()
  cb(null,Send(200,data))

  } catch (err){
    cb(null,Send(500,err.message))
  }
};

module.exports.getAllNotes = async (event,context,cb) => {

  try {
    let params={
      TableName:NOTES_TABLE_NAME
    }
    const notes=await DocumentClient.scan(params).promise()
 cb(null,Send(200,notes))
    
  } catch (err) {
    cb(null,500,Send(err.message))
  }
  return {
    statusCode: 200,
    body: JSON.stringify("A new  notes is getting"),
  };
};

module.exports.deleteNotes = async (event,context,cb) => {
  let notesId=event.pathParameters.id;

  try {
    let params={
      TableName:NOTES_TABLE_NAME,
      Key:{
        notesId
      },
      ConditionExpression: "attribute_exists(notesId)"
    }
    await DocumentClient.delete(params).promise()
  cb(null,Send(200,notesId))
  } catch (err) {
    cb(null,Send(500,err.message))
  }
};

module.exports.updateNotes = async (event ,context,cb) => {
  let notesId=event.pathParameters.id;
  let data=JSON.parse(event.body)
try{
  let params={
    TableName:NOTES_TABLE_NAME,
    Key:{
      notesId
    },
    UpdateExpression:"set #title = :title , #body = :body",
    ExpressionAttributeNames:{
      "#title": "title",
      "#body" : "body"
    },
    "ExpressionAttributeValues":{
    ":title":data.title,
    ":body" :data.body
    },
    ConditionExpression: "attribute_exists(notesId)" 
  }
  await DocumentClient.update(params).promise()
  cb(null,Send(201,data))
}catch (err){
  cb(null,Send(500,err.message))
}
   
};

