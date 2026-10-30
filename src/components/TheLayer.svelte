<script>
    import { onMount, onDestroy } from 'svelte';
    import StoreCookieService from "../services/StoreCookieService.js";
    import SetAllServices from "./ui/SetAllServices.svelte";
    import SaveButton from "./layer/SaveButton.svelte";
    import ServiceGroups from "./layer/ServiceGroups.svelte";
    import {t} from "../services/TranslationService.js";
    import {
        bannerVisible,
        denyAllOnLayerClose,
        openSettingsHash,
        layerOpen,
        services,
        showDenyAll,
        closeLayer,
        setAllServices
    } from "../store.js";

    let willRefocusOpener = false;

    function closeLayerDeny() {
        closeLayer();
        if ($denyAllOnLayerClose) {
            const servicesCookies = StoreCookieService.getServices();
            if (servicesCookies && Object.keys(servicesCookies).length === 0) {
                let servicesState = {...$services};
                for (let id in servicesState) {
                    servicesState[id] = false;
                }
                StoreCookieService.setServices(servicesState);
                setAllServices(servicesState)
                return false;
            }
        }
    }

    function refocusOpener() {
        if (willRefocusOpener) {
            const hrefSelector = `a[href="${$openSettingsHash}"]`;
            let settingsBtn = document.querySelector('.cookiesjsr-settings') || document.querySelector(hrefSelector);
            if (settingsBtn) { settingsBtn.focus(); }
        }
    }

    function tabCycle(event) {
        if (event.key === 'Tab') {
            const selector = (event.shiftKey) ? '.dialog-last-tab' : '.dialog-first-tab';
            let isIn = document.querySelector('.cookiesjsr-layer-wrapper').contains(document.activeElement);
            if (!isIn) {
                let activeElement = document.querySelector(selector)
                if (activeElement) {
                    activeElement.focus()
                }
            }
        }
    }

    onMount(() => {
        let activeElement = document.querySelector('.dialog-first-tab')
        if (activeElement) {
            activeElement.focus()
        }
        const servicesCookies = StoreCookieService.getServicesStatus();
        setAllServices(servicesCookies)
        willRefocusOpener = !$bannerVisible;
        document.addEventListener("keyup", tabCycle);
    });

    onDestroy(() => {
        document.removeEventListener("keyup", tabCycle);
        refocusOpener();
        if (window.location.hash === $openSettingsHash) {
            window.location.hash = '';
        }
    });
</script>

<div class="cookiesjsr-layer-wrapper">
    <button class="cookiesjsr-layer-overlay" title={t('close')} on:click={closeLayer} aria-label={t('close')} ></button>
    <div class="cookiesjsr-layer">
        <header class="cookiesjsr-layer__header">
            <span class="cookiesjsr-layer__title">{t('cookieSettings')}</span>
            <button type="button" class="cookiesjsr-layer__close dialog-first-tab" title={t('close')}
                    on:click={closeLayerDeny}>{t('close')}</button>
        </header>
        <div class="cookiesjsr-layer__body">
            <ServiceGroups/>
        </div>
        <footer class="cookiesjsr-layer__footer">
            <div class="cookiesjsr-layer__label-all">{t('settingsAllServices')}</div>
            <div class="cookiesjsr-layer__actions">
                {#if $showDenyAll}
                    <SetAllServices btnType="invert denyAll" setAll={false}>{t('denyAll')}</SetAllServices>
                {/if}
                <SetAllServices btnType="invert allowAll" setAll={true}>{t('acceptAll')}</SetAllServices>
                <SaveButton>{t('saveSettings')}</SaveButton>
            </div>
        </footer>
    </div>
</div>
<span tabIndex="0"></span>
