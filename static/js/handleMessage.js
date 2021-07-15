exports.handleClientMessage_CUSTOM = (hook, context, cb)=>{
    if(context.payload.action == "recieveTitleMessage"){
      var message = context.payload.message;
      var title
        if(message){
          title= message
        }else{
          var padId = pad.getPadId() ;
          title = padId

        }
        $("#generalItem").html(title)
        $("#generalItem").attr("title",title)

    }
 
    return []
  }