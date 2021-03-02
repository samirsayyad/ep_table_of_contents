/* global tableOfContents */
'use strict';

exports.postAceInit = () => {
  if (!$('#editorcontainerbox').hasClass('flex-layout')) {
    $.gritter.add({
      title: 'Error',
      text:
      'Ep_table_of_contents: Please upgrade to etherpad 1.8.3 for this plugin to work correctly',
      sticky: true,
      class_name: 'error',
    });
  }
  /* on click */
  $('#options-toc').on('click', () => {
    if ($('#options-toc').is(':checked')) {
      tableOfContents.enable(); // enables line tocping
    } else {
      $('#options-toc').attr('checked', false);
      tableOfContents.disable(); // disables line tocping
    }
  });
  if ($('#options-toc').is(':checked')) {
    tableOfContents.enable();
  } else {
    tableOfContents.disable();
  }

  const urlContainstocTrue =
  (tableOfContents.getParam('toc') === 'true'); // if the url param is set
  if (urlContainstocTrue) {
    $('#options-toc').attr('checked', 'checked');
    tableOfContents.enable();
  } else if (tableOfContents.getParam('toc') === 'false') {
    $('#options-toc').attr('checked', false);
    tableOfContents.disable();
  }


  $("#collapserClose , #collapserOpen").click(function(){
    if($("#tocItems").hasClass("hide-toc")){
      $("#toc").css({"display":"block"})
      setTimeout(()=>{
        $("#tocItems").removeClass("hide-toc")
        $("#tocItems").addClass("show-toc")
        $("#collapserClose").css({"left":"2%"})
        $("#collapserOpen").css({"left":"-2%"})
        let padOuter = $('iframe[name="ace_outer"]').contents();
        padOuter.find('#outerdocbody').attr('style', 'justify-content: unset !important');
      },10)
    }else{
      $("#tocItems").removeClass("show-toc")
      $("#tocItems").addClass("hide-toc")
      $("#collapserClose").css({"left":"-2%"})
      $("#collapserOpen").css({"left":"1%"})
      setTimeout(()=>{
        $("#toc").css({"display":"none"})
        let padOuter = $('iframe[name="ace_outer"]').contents();
        padOuter.find('#outerdocbody').attr('style', 'justify-content: center !important');
      },10)
    }
  })

};
