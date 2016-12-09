/**
 * Created by scuerda on 12/21/15.
 */
$(document).ready( function() {

    // Test page URL and highlight relevent navbar text
    $('.nav-item').removeClass('active');
    var loc = window.location.href; // returns the full URL
    if(/about/.test(loc)) {
        $('.nav-item > a[href*="/about"]').parent().addClass('active');
    } else if(/\/data/.test(loc)) {
        $('.nav-item a[href*="/data"]').parent().addClass('active');
    } else if(/\/academy/.test(loc)) {
        $('.nav-item a[href*="/academy"]').parent().addClass('active');
    } else if(/services/.test(loc)) {
        $('.nav-item > a[href*="/services"]').parent().addClass('active');
    } else if(/ask/.test(loc)) {
        $('.nav-item > a[href*="/ask"]').parent().addClass('active');
    } else if (/news/.test(loc)) {
        $('.nav-item > a[href*="/news"]').parent().addClass('active');
    } else if (/tag/.test(loc)) {
        $('.nav-item > a[href*="/news"]').parent().addClass('active');
    } else {
        $('.nav-item > a:contains("Home")').parent().addClass('active');
    }
});
