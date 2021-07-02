exports.handleClientMessage_CUSTOM = (hook, context, cb)=>{
    if(context.payload.action == "recieveTitleMessage"){
      var message = context.payload.message;
        if(message){
          $("#generalItem").html(message)
        }else{
          var padId = pad.getPadId() ;
          $("#generalItem").html(padId)

        }
    }
 
    return []
  }