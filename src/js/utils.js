function resetOptions(dropdown) {
    while (dropdown.options.length > 0) {
        dropdown.remove(0);
    }

    dropdown.options[0] = new Option("", "");

}