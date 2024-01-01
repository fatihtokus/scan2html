function resetOptions(dropdown) {
    while (dropdown.options.length > 0) {
        dropdown.remove(0);
    }

    dropdown.options[0] = new Option("", "");

}

function getURLParameter(paramName)
    {
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++)
      {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == paramName)
        {
            return sParameterName[1];
        }
      }
    }