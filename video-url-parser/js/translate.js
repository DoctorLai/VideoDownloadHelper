"use strict";

// translation a text
const translate_text = (dom, lang, text) => {
    const s = lang[text];
    if (s) {
        dom.html(s);
    }
}

// translation language
const translation = (lang) => {
    translate_text($('a#text_setting'), lang, 'setting');
    translate_text($('a#text_log'), lang, 'log');
    translate_text($('h4#text_ui_language'), lang, 'ui_language');
    translate_text($('h4#text_dark_mode'), lang, 'dark_mode');
    translate_text($('span#text_dark_desc'), lang, 'dark_desc');
    translate_text($('h4#text_logs'), lang, 'text_logs');
    translate_text($('h4#text_vip_server_api_key'), lang, 'text_vip_server_api_key');
    translate_text($('div#vip_desc'), lang, 'vip_desc');
    translate_text($('span#source_code'), lang, 'source_code');
    translate_text($('a#report_bugs'), lang, 'report_bugs');
    translate_text($('button#setting_save_btn'), lang, 'save');
	translate_text($('span#proudly_brought_to_you_by'), lang, 'proudly_brought_to_you_by');
    translate_text($('span#vpspromotion'), lang, 'freevps');
    translate_text($('a#text_video_downloader'), lang, 'video_downloader');
    translate_text($('button#pic'), lang, 'images');
    translate_text($('button#vid'), lang, 'videos');
    translate_text($('button#links'), lang, 'links');
    translate_text($('button#merger'), lang, 'merger');
}

// get ui lang data
const get_lang = () => {
    const lang = $('select#lang').val();
    switch (lang) {
        case 'zh-cn': return (translation_simplified_chinese);
        case 'en-us': return (translation_english);
        case 'zh-tw': return (translation_traditional_chinese);
        case 'de-de': return (translation_de_de);
        case 'es-sp': return (translation_es_sp);
        case 'fr-fr': return (translation_fr_fr);
        case 'it-it': return (translation_it_it);
        case 'ru-ru': return (translation_ru_ru);
        case 'nl-nl': return (translation_nl_nl);
        case 'pt-br': return (translation_pt_br);
        case 'pl-pl': return (translation_pl_pl);
        case 'ro-ro': return (translation_ro_ro);
        case 'tr-tr': return (translation_tr_tr);
        case 'ja-jp': return (translation_ja_jp);
        case 'ko-kr': return (translation_ko_kr);
        case 'ar-sa': return (translation_ar_sa);
        case 'hi-in': return (translation_hi_in);
        case 'bn-in': return (translation_bn_in);
        case 'id-id': return (translation_id_id);
        case 'vi-vn': return (translation_vi_vn);
        case 'th-th': return (translation_th_th);
        case 'uk-ua': return (translation_uk_ua);
        case 'cs-cz': return (translation_cs_cz);
        case 'el-gr': return (translation_el_gr);
        case 'sv-se': return (translation_sv_se);
    }
}

// ui translate
const ui_translate = () => {
	const data = get_lang();
	translation(data);
}

// translate
const get_text = (x, default_text = '') => {
	const lang = get_lang();
	if (lang && lang[x]) {
		return lang[x];
	}
	return default_text;
}
