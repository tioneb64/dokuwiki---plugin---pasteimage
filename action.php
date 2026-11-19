<?php

use dokuwiki\Extension\ActionPlugin;
use dokuwiki\Extension\Event;
use dokuwiki\Extension\EventHandler;

/**
 * Pasteimage : coller une image ou déposer des fichiers dans l'éditeur les envoie dans les médias
 * de l'espace de noms de la page (même emplacement que le bouton d'ajout d'image) et insère le lien.
 * L'envoi passe par le service « mediaupload » de DokuWiki : droits, types de fichiers autorisés,
 * taille maximale, anciennes révisions et journal des médias sont ceux du gestionnaire de médias.
 */
class action_plugin_pasteimage extends ActionPlugin
{
    /** @inheritdoc */
    public function register(EventHandler $controller)
    {
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'jsinfo');
    }

    public function jsinfo(Event $event)
    {
        global $JSINFO, $ACT;
        if (!in_array($ACT, ['edit', 'preview'], true)) return;
        $JSINFO['pasteimage'] = [
            'style' => $this->getConf('linkstyle') === 'dokuwiki' ? 'dokuwiki' : 'obsidian',
            'prefix' => (string)$this->getConf('prefix'),
        ];
    }
}
