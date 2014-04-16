// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

window.linkify = (function(){
  var
    SCHEME = "[a-z\\d.-]+://",
    IPV4 = "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
    HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
    TLD = "(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)",
    HOST_OR_IP = "(?:" + HOSTNAME + TLD + "|" + IPV4 + ")",
    PATH = "(?:[;/][^#?<>\\s]*)?",
    QUERY_FRAG = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
    URI1 = "\\b" + SCHEME + "[^<>\\s]+",
    URI2 = "\\b" + HOST_OR_IP + PATH + QUERY_FRAG + "(?!\\w)",
    
    MAILTO = "mailto:",
    EMAIL = "(?:" + MAILTO + ")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + HOST_OR_IP + QUERY_FRAG + "(?!\\w)",
    
    URI_RE = new RegExp( "(?:" + URI1 + "|" + URI2 + "|" + EMAIL + ")", "ig" ),
    SCHEME_RE = new RegExp( "^" + SCHEME, "i" ),
    
    quotes = {
      "'": "`",
      '>': '<',
      ')': '(',
      ']': '[',
      '}': '{',
      '»': '«',
      '›': '‹'
    },
    
    default_options = {
      callback: function( text, href ) {
        return href ? '<a href="' + href + '" title="' + href + '" target="_blank">' + text + '<\/a>' : text;
      },
      punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
    };
  
  return function( txt, options ) {
	txt = getSmileys(txt);
	txt = txt.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br />');
	
    options = options || {};
    
    // Temp variables.
    var arr,
      i,
      link,
      href,
      
      // Output HTML.
      html = '',
      
      // Store text / link parts, in order, for re-combination.
      parts = [],
      
      // Used for keeping track of indices in the text.
      idx_prev,
      idx_last,
      idx,
      link_last,
      
      // Used for trimming trailing punctuation and quotes from links.
      matches_begin,
      matches_end,
      quote_begin,
      quote_end;
    
    // Initialize options.
    for ( i in default_options ) {
      if ( options[ i ] === undefined ) {
        options[ i ] = default_options[ i ];
      }
    }
    
    // Find links.
    while ( arr = URI_RE.exec( txt ) ) {
      
      link = arr[0];
      idx_last = URI_RE.lastIndex;
      idx = idx_last - link.length;
      
      // Not a link if preceded by certain characters.
      if ( /[\/:]/.test( txt.charAt( idx - 1 ) ) ) {
        continue;
      }
      
      // Trim trailing punctuation.
      do {
        // If no changes are made, we don't want to loop forever!
        link_last = link;
        
        quote_end = link.substr( -1 )
        quote_begin = quotes[ quote_end ];
        
        // Ending quote character?
        if ( quote_begin ) {
          matches_begin = link.match( new RegExp( '\\' + quote_begin + '(?!$)', 'g' ) );
          matches_end = link.match( new RegExp( '\\' + quote_end, 'g' ) );
          
          // If quotes are unbalanced, remove trailing quote character.
          if ( ( matches_begin ? matches_begin.length : 0 ) < ( matches_end ? matches_end.length : 0 ) ) {
            link = link.substr( 0, link.length - 1 );
            idx_last--;
          }
        }
        
        // Ending non-quote punctuation character?
        if ( options.punct_regexp ) {
          link = link.replace( options.punct_regexp, function(a){
            idx_last -= a.length;
            return '';
          });
        }
      } while ( link.length && link !== link_last );
      
      href = link;
      
      // Add appropriate protocol to naked links.
      if ( !SCHEME_RE.test( href ) ) {
        href = ( href.indexOf( '@' ) !== -1 ? ( !href.indexOf( MAILTO ) ? '' : MAILTO )
          : !href.indexOf( 'irc.' ) ? 'irc://'
          : !href.indexOf( 'ftp.' ) ? 'ftp://'
          : 'http://' )
          + href;
      }
      
      // Push preceding non-link text onto the array.
      if ( idx_prev != idx ) {
        parts.push([ txt.slice( idx_prev, idx ) ]);
        idx_prev = idx_last;
      }
      
      // Push massaged link onto the array
      parts.push([ link, href ]);
    };
    
    // Push remaining non-link text onto the array.
    parts.push([ txt.substr( idx_prev ) ]);
    
    // Process the array items.
    for ( i = 0; i < parts.length; i++ ) {
      html += options.callback.apply( window, parts[i] );
    }
    
    // In case of catastrophic failure, return the original text;
    return html || txt;
  };
  
})();

function getSmileys(text) {
    return text;
	// return text.replace(/:\)/g, '<img class="smiley" src="data:image/gif;base64,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">');
}
