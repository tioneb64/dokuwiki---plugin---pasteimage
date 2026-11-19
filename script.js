/**
 * Pasteimage : un copier-coller d'image (ou un glisser-déposer de fichiers) dans l'éditeur envoie
 * le fichier dans les médias de l'espace de noms de la page, puis insère le lien au curseur.
 */
jQuery(function () {
    'use strict';
    var cfg = window.JSINFO && JSINFO.pasteimage;
    var $text = jQuery('#wiki__text');
    if (!cfg || !$text.length) return;

    var L = (window.LANG && LANG.plugins && LANG.plugins.pasteimage) || {};
    function t(key, arg, dflt) { return (L[key] || dflt).replace('%s', arg); }

    var $status = jQuery('<div id="plugin_pasteimage_status" role="status"></div>');
    $text.before($status);
    var timer = null;

    function say(cls, parts) {
        clearTimeout(timer);
        $status.attr('class', cls || '').empty();
        [].concat(parts).forEach(function (p) { if (p) $status.append(p); });
        if (cls === 'pi-ok') timer = setTimeout(function () { $status.empty().attr('class', ''); }, 6000);
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function stamp() {
        var d = new Date();
        return '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }

    var EXT = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/bmp': 'bmp'};

    /** Nom du fichier envoyé : une image collée n'a que le nom générique « image.png » */
    var seq = 0;
    function nameFor(file) {
        var name = file.name || '';
        var generic = !name || /^image\.[a-z0-9]+$/i.test(name);
        if (generic && /^image\//.test(file.type)) {
            seq++;
            return (cfg.prefix || 'Pasted image ') + stamp() + (seq > 1 ? '_' + seq : '') + '.' + (EXT[file.type] || 'png');
        }
        return name || ('file_' + stamp());
    }

    function sectok() { return jQuery('#dw__editform input[name=sectok]').val() || ''; }

    /** Insère du texte à la position donnée (celle du curseur au moment du collage) */
    function insert(textToInsert, pos) {
        var el = $text[0];
        var at = (typeof pos === 'number' && pos <= el.value.length) ? pos : el.selectionStart;
        el.setRangeText(textToInsert, at, at, 'end');
        $text.trigger('input').trigger('change');
        el.focus();
    }

    function linkFor(id, name, isImage) {
        if (cfg.style === 'dokuwiki') {
            return isImage ? '{{:' + id + '}}' : '{{:' + id + '|' + name + '}}';
        }
        return '![[' + id.replace(/^.*:/, '') + ']]';
    }

    function upload(file, pos) {
        var name = nameFor(file);
        var isImage = /^image\//.test(file.type);
        var url = DOKU_BASE + 'lib/exe/ajax.php?call=mediaupload&ns=' + encodeURIComponent(JSINFO.namespace || '') +
            '&qqfile=' + encodeURIComponent(name) + '&sectok=' + encodeURIComponent(sectok());
        var $thumb = isImage ? jQuery('<img alt="">').attr('src', URL.createObjectURL(file)) : null;
        say('', [$thumb, document.createTextNode(t('sending', name, 'Envoi de %s…'))]);

        return fetch(url, {method: 'POST', body: file, headers: {'X-Requested-With': 'XMLHttpRequest'}, credentials: 'same-origin'})
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (!res || !res.success) throw new Error((res && res.error) || '');
                insert(linkFor(res.id, name, isImage) + '\n', pos);
                say('pi-ok', [$thumb, document.createTextNode(t('done', res.id.replace(/^.*:/, ''), '%s ajouté aux médias'))]);
            })
            .catch(function (e) {
                say('pi-error', document.createTextNode(t('error', name, 'Échec de l\'envoi de %s') + (e && e.message ? ' : ' + e.message : '')));
            });
    }

    /** Envoie les fichiers l'un après l'autre : chaque lien est inséré à la suite du précédent */
    function uploadAll(files) {
        var pos = $text[0].selectionStart;
        var chain = Promise.resolve();
        Array.prototype.forEach.call(files, function (f) {
            chain = chain.then(function () { return upload(f, pos).then(function () { pos = $text[0].selectionStart; }); });
        });
    }

    /** Coller : on prend la main pour une image seule, pas pour un vrai texte accompagné d'une image */
    $text.on('paste', function (e) {
        var cd = (e.originalEvent || e).clipboardData;
        if (!cd || !cd.files || !cd.files.length) return;
        var plain = (cd.getData('text/plain') || '').trim();
        var names = Array.prototype.map.call(cd.files, function (f) { return f.name; });
        var isPath = /^[A-Za-z]:\\|^\//.test(plain);          // un fichier copié donne parfois son nom ou son chemin
        if (plain !== '' && /\s/.test(plain) && names.indexOf(plain) === -1 && !isPath) return;   // vrai texte : collage normal
        e.preventDefault();
        uploadAll(cd.files);
    });

    /** Glisser-déposer de fichiers */
    $text.on('dragover', function (e) {
        var dt = (e.originalEvent || e).dataTransfer;
        if (dt && Array.prototype.indexOf.call(dt.types || [], 'Files') !== -1) {
            e.preventDefault();
            $text.addClass('pi-drop');
        }
    }).on('dragleave drop', function () {
        $text.removeClass('pi-drop');
    }).on('drop', function (e) {
        var dt = (e.originalEvent || e).dataTransfer;
        if (!dt || !dt.files || !dt.files.length) return;
        e.preventDefault();
        uploadAll(dt.files);
    });
});
