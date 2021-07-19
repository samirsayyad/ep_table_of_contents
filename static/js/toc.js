'use strict';

$('#tocButton').click(() => {
  $('#toc').toggle();
});

const tableOfContents = {

  enable() {
    $('#toc').show();
    $('#collapserContainer').show();
    $('#headerContainer').show();
    this.update();
  },

  disable: () => {
    $('#toc').hide();
    $('#headerContainer').hide();
    $('#collapserContainer').hide();

  },

  // Find Tags
  findTags: () => {
    const toc = {}; // The main object we will use
    const tocL = {}; // A per line record of each TOC item
    let count = 0;
    //let delims = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.h1', '.h2', '.h3', '.h4', '.h5', '.h6'];
    let delims = ['h1', 'h2', 'h3', 'h4', '.h1', '.h2', '.h3', '.h4'];
    if (clientVars.plugins.plugins.ep_context) {
      if (clientVars.plugins.plugins.ep_context.styles) {
        const styles = clientVars.plugins.plugins.ep_context.styles;
        $.each(styles, (k, style) => {
          const contextStyle = `context${style.toLowerCase()}`;
          delims.push(contextStyle);
        });
      }
    }

    var lastScrollTop = 0;
    $('#toc').scroll(function(event){
      var st = $(this).scrollTop();
      if (st > lastScrollTop){
        $("#bottomNewMention").css({"display":"none"})
      } 
      lastScrollTop = st;
    });


    delims = delims.join(',');
    const hs =
    $('iframe[name="ace_outer"]').contents().find('iframe')
        .contents().find('#innerdocbody').children('div').children(delims);
    var lastTag=1;
    var lastTagHeaderId;
    $(hs).each(function () {
      // Remember lineNumber is -1 what a user sees
      const lineNumber = $(this).parent().prevAll().length;
      let tag = this.nodeName.toLowerCase();
      const newY = `${this.offsetTop}px`;
      let linkText = $(this).text(); // get the text for the link
      const focusId = $(this).parent()[0].id; // get the id of the link
      let headerId = $(this).find('.videoHeader').attr('data-id') || $(this).attr('data-id');
      
      if (tag === 'span') {
        tag = $(this).attr('class').replace(/.*(h[1-6]).*/, '$1');
        linkText = linkText.replace(/\s*#*/, '');
      }
      var currentTag = parseInt(tag.substring(1));
      var parentHeaderId = headerId;
      if (currentTag > lastTag ){
        parentHeaderId = lastTagHeaderId;
      }

      // Create an object of lineNumbers that include the tag
      tocL[lineNumber] = tag;
      lastTag = currentTag
      lastTagHeaderId = headerId
      
      // Does the previous line already have this delim?
      // If so do nothing..
      if (tocL[lineNumber - 1]) {
        if (tocL[lineNumber - 1] === tag) return;
      }
      toc[count] = {
        tag,
        y: newY,
        text: linkText,
        focusId,
        lineNumber,
        headerId,
        parentHeaderId
      };
      count++;
    });

    clientVars.plugins.plugins.ep_table_of_context = toc;
    let tocContent = '';
    $.each(toc, (h, v) => { // for each item we should display
      const TOCString =
      `<div  id='${v.headerId}_container' class="itemRow tocItem">
      <div class="titleRow">
      <div id='${v.headerId}' parent='${v.parentHeaderId}' title='${v.text}' class='toc${v.tag}' data-class='toc${v.tag}' \
      onClick="tableOfContents.scroll('${v.y}','${v.headerId}','${v.parentHeaderId}','${v.text}');" data-offset='${v.y}'>${v.text}</div>
      </div>
      <div id='${v.headerId}_notification' class="notifyRow">
      
      </div>
    </div>`;
      tocContent += TOCString;
    });
    $('#tocItems').html(tocContent);
    $("#generalItem").html($("#title").val())
    tableOfContents.scrollToHeaderByFirstTime(toc)
  },

  // get HTML
  getPadHTML: (rep) => {
    if ($('#options-toc').is(':checked')) {
      tableOfContents.findTags();
    }
  },

  // show the current position
  showPosition: (rep) => {
    // We need to know current line # -- see rep
    // And we need to know what section is before this line number
    const toc = clientVars.plugins.plugins.ep_table_of_context;
    if (!toc) return false;
    const repLineNumber = rep.selEnd[0]; // line Number

    // So given a line number of 10 and a toc of [4,8,12] we want to find 8..
    $.each(toc, (k, line) => {
      if (repLineNumber >= line.lineNumber) {
        // we might be showing this..
        const nextLine = toc[k];
        if (nextLine.lineNumber <= repLineNumber) {
          const activeToc = parseInt(k) + 1;

          // Seems expensive, we go through each item and remove class
          $('.tocItem').each(function () {
            $(this).removeClass('activeTOC');
          });

          $(`.toch${activeToc}`).addClass('activeTOC');
        }
      }
    });
  },
  

  update: (rep) => {
    if (rep) {
      tableOfContents.showPosition(rep);
    }
    tableOfContents.getPadHTML(rep);
  },

  scroll: (newY,headerId,parentHeaderId,title) => {
    const lastActiveHeader = localStorage.getItem("lastActiveHeader");
    const params = new URLSearchParams(location.search);
    params.set('header', "");
    params.set('id', headerId);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
    
    const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');
    const $outerdocHTML = $outerdoc.parent();
    $outerdoc.animate({scrollTop: newY});
    $outerdocHTML.animate({scrollTop: newY}); // needed for FF

    // if(headerId == parentHeaderId ){
    //   $("#parent_header_chat_room").text('');
    // }else{
    //   var parentTitle = $(`#${parentHeaderId}`).attr('title');
    //   console.log("parentTitle",parentTitle)
    //   $("#parent_header_chat_room").text(`${tableOfContents.trimLeftTexts(parentTitle)} /`);
    // }
    // $("#master_header_chat_room").text(tableOfContents.trimLeftTexts(title));


    var headerText="";
    if(headerId && headerId!==""){
        if(headerId == parentHeaderId){ // it means, it's root
            headerText =$(`#${headerId}`).attr("title");
        }else{
            var paginateHeaderId= headerId ;
            headerText = $(`#${paginateHeaderId}`).attr("title") + " / ";
            do{
                paginateHeaderId = parentHeaderId
                parentHeaderId = $(`#${paginateHeaderId}`).attr("parent");
                headerText = $(`#${paginateHeaderId}`).attr("title") + " / " + headerText;

            }while( paginateHeaderId != parentHeaderId )

            headerText = headerText.substring(0, headerText.length - 2); // in order to remove extra / end of text - :D
            
        }
    }

    
    $("#master_header_chat_room").text(tableOfContents.trimLeftTexts(headerText));


    if(lastActiveHeader != headerId){
      tableOfContents.changeHighlightPosition(headerId,lastActiveHeader)

      //switching chat rooms _ ep_rocketchat
      const message = {
        type: 'ep_rocketchat',
        action: 'ep_rocketchat_handleRooms',
        userId : pad.getUserId(),
        padId: pad.getPadId(),
        data: {     
          headerId : headerId,
          title : title ,
        },
      };
      pad.collabClient.sendMessage(message);
  
      tableOfContents.applyUi()
    }



  },

  scrollToHeaderByFirstTime : (toc)=>{
    const params = new URLSearchParams(location.search);
    const headerId = params.get('id');
    console.log("headerId",headerId)
    if(headerId && headerId!==""){
      tableOfContents.changeHighlightPosition(headerId);
      var headerObject=null;
      $.each(toc, (h, v) => { 
        if (v.headerId==headerId){
          headerObject = v;
        }
      })
      console.log("headerObject",headerObject)

      if(headerObject){
        tableOfContents.scroll(headerObject.y,headerObject.headerId,
          headerObject.parentHeaderId,headerObject.text) // read url and scroll
      }
    }else{
      tableOfContents.changeHighlightPosition("general");

    }


  },

  changeHighlightPosition : (headerId,lastActiveHeader)=>{
    $(`#${lastActiveHeader}_container`).removeClass("highlightHeader");
    $(`#${headerId}_container`).addClass("highlightHeader");
    localStorage.setItem("lastActiveHeader",headerId);
  },
  applyUi:()=>{

    $("#toc").css({"border-right":"1px solid #DADCE0"});
    $(".headerContainer").css({"border-right":"1px solid #DADCE0"});
    $("#editorcontainer iframe").removeClass('fullHeightEditor')
    $("#editorcontainer iframe").addClass('chatHeightEditor')
    $("#ep_rocketchat_container").show();

  },

  scrollToTop : () =>{
    var title = "";
    var newY = 0 ;
    const params = new URLSearchParams(location.search);
    params.set('header', "");
    params.set('id', "");
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
    
    const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');
    const $outerdocHTML = $outerdoc.parent();
    $outerdoc.animate({scrollTop: newY});
    $outerdocHTML.animate({scrollTop: newY}); // needed for FF

    $("#parent_header_chat_room").text('');
    $("#master_header_chat_room").text( tableOfContents.trimLeftTexts($("#generalItem").attr("title")));

    tableOfContents.changeHighlightPosition("general")
    //switching chat rooms _ ep_rocketchat
    const message = {
      type: 'ep_rocketchat',
      action: 'ep_rocketchat_handleRooms',
      userId : pad.getUserId(),
      padId: pad.getPadId(),
      data: {            headerId : `GENERAL`,
        title : title ,
      },
    };
    pad.collabClient.sendMessage(message);

    tableOfContents.applyUi()

  },

  trimLeftTexts:(text)=>{
    const characterLimit=70
    if(text.length > characterLimit){
      var newText = "..."+text.substr((text.length - 1)-characterLimit,characterLimit);
      return newText;
    }
    return text;
    
  },

  getParam: (sname) => {
    let params = location.search.substr(location.search.indexOf('?') + 1);
    let sval = '';
    params = params.split('&');
    // split param and value into individual pieces
    for (let i = 0; i < params.length; i++) {
      const temp = params[i].split('=');
      if ([temp[0]] === sname) { sval = temp[1]; }
    }
    return sval;
  },

};
