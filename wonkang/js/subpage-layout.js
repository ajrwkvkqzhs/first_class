/* Shared native dropdown behavior across all subpages. */
document.querySelectorAll('.subpage-depth__dropdown').forEach(dropdown => {
    document.addEventListener('click', event => {
        if (!dropdown.contains(event.target)) dropdown.open = false;
    });
    dropdown.addEventListener('keydown', event => {
        if (event.key === 'Escape' && dropdown.open) {
            dropdown.open = false;
            dropdown.querySelector('summary').focus();
        }
    });
});
