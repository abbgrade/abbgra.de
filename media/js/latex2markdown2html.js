$(document).ready(function() {

    // look for anchors in headers
    $(':header').each(function(){
        if($(this).next().text().match(/\[(.+?)\]/) && $(this).next().text().length < 50 )
        {
            console.log("add anchor to header (brackets) " + $(this).next().text());
            $(this).append($(this).next().html().replace(/\[(.+?)\]/gi, '<span id="$1" />'));
            $(this).next().remove();
        }

        // replace 'Introduction { #chap:introduction}' to 'Introduction <span id="chap:introduction" />'
        if($(this).html().match(/.+? \{.(.+?)\}/))
        {
            console.log("add anchor to header (braces) " + $(this).text());
            $(this).html($(this).html().replace(/(.+?) \{.(.+?)\}/gi, '$1 <span id="$2" />'));
        }
    });

    // look for anchors in paragraphs
    $('p').each(function(){
        var paragraph = this;

        // replace '\label{foo}'
        if($(this).html().match(/.+?\\label\{(.+)\}/))
        {
            console.log("add anchor to paragraph (braces) " + $(this).text());
            $(this).html($(this).html().replace(/\\label\{(.+?)\}(\n?)/gi, '<span id="$1" />'));
        }

        $(this).html($(this).html().replace(/\s\\\s/gi, ' \\\\\n'));

    });

    // look for anchors in paragraphs
    $('p').each(function(){
        var paragraph = this;

        $(new RegExp(/\[(.+?:.+?)\]/).exec($(paragraph).text())).each(function(){
            var reference = this.replace(/\[(.+?)\]/, '$1');
            var title = $("*[id='"+reference+"']");

            if($.trim($(paragraph).text()).indexOf($.trim(this)) == 0)
            {
                console.log("add anchor to paragraph (brackets): " + reference);
                $(paragraph).html($(paragraph).html().replace('\['+reference+'\]', '<span id="'+reference+'" />'));
            }
        });

    });

    $('p').each(function(){
        var paragraph = this;
        $(new RegExp(/\[(.+?:.+?)\]/).exec($(paragraph).text())).each(function(){
            var reference = this;
            reference = reference.replace(/\[(.+?)\]/, '$1');
            var dest_reference = reference;

            var title = $("*[id='"+reference+"']");

            if(title.length == 0)
            {
                dest_reference = reference.replace(new RegExp("~(.)~", "g"), '_$1');
                title = $("*[id='"+dest_reference+"']");
            }

            if(title.length == 0)
            {
                dest_reference = reference.replace(new RegExp("._(.)", "g"), '~$1~');
                title = $("*[id='"+dest_reference+"']");
            }

            if(title.length > 0)
            {
                var heading = $(title).first().parent();
                var link_text = reference;

                if($.trim(heading.text()).length > 0)
                {
                    link_text = heading.text();
                }

                console.log("linking to " + link_text);
                $(paragraph).html($(paragraph).text().replace('\['+reference+'\]', '<a href="#'+dest_reference+'">' + link_text + '</a>'));
            }
            else
            {
                console.log("missing reference: " + dest_reference);
            }
        });
    });
});