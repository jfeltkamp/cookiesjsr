# Cookies JSR

Easy plug-able cookie consent management tool built with React.

* Allows GDPR conform cookie consent management.
* Allows grouped and individual consent.
* Allows easy integration of new 3rd-party services.
* Supports translation.
* Allows custom styling.

This tool does not contain any services that implements external resources, such as Analytics or Youtube.
It is an easily configurable framework, with which it is possible to obtain the user's consent to the use of cookies,
to save his decisions (also in a cookie) and provides an event as entry point for dispatching own services.

## Install

1. Create your ```cookiesjsr-config.json``` file where you define your groups and services.
2. Create your ```cookiesjsr-init.js``` file where you initialize the services.
3. Place the following HTML before the closing body-tag.

... and you are done.

```html
<html lang="de">
<head>
   ...
   <link rel="stylesheet" media="screen" href="https://cdn.jsdelivr.net/gh/jfeltkamp/cookiesjsr@1/dist/cookiesjsr.min.css">
</head>
<body>
...

<!-- The Place where cookiesjsr can live in. -->
<div id="cookiesjsr"></div>
<script src="/path/to/your/cookiesjsr-init.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jfeltkamp/cookiesjsr@1/dist/cookiesjsr.min.js"></script>
</body>
</html>
```

### Example ```cookiesjsr-config.json```
([Documentation](#docs-config))
```json
{
   "config": {
      "cookie": {
         "name": "cookiesjsr",
         "expires": 31536000000
      },
      "interface": {
         "openSettingsHash": "#editCookieSettings",
         "translationQuery": "/cookiesjsr/lang/%lang_id/translation.json",
         "availableLangs": ["en", "de", "es", "fr", "it", "nl", "pl", "ru"],
         "defaultLang": "en"
      }
   },
   "services": {
      "default": {
         "id": "default",
         "services": []
      },
      "analytic": {
         "id": "analytic",
         "services": [{
            "key": "gtag",
            "type": "analytic",
            "name": "Google Analytics",
            "uri": "https://support.google.com/analytics/answer/6004245",
            "needConsent": true
         },
            {
               "key": "matomo",
               "type": "analytic",
               "name": "Matomo",
               "uri": "https://matomo.org/docs/privacy/",
               "needConsent": true
            }
         ]
      }
   }
}
```

### Example ```cookiesjsr-init.js```

This file basically gives the base config to the JS library (see object: ```document.cookiesjsr```), where the library
can find their config file. ([Documentation](#base-config))

<a name="manage-event"></a> But you can also dispatch your consent dependent services inside of this file.
([Further best practices](#service-activation))

````js
// Base configuration 
document.cookiesjsr = {
   apiUrl: '',
   configQuery: '/path/to/your/cookiesjsr-config.json'
}

var dispatcher = {
   matomo: {
      activate: function() {
         // Do stuff to enable Matomo. See best practices below.
      },
      fallback: function() {
         // Do stuff to fallback. E.g. display layer where the benefits are explained,
         // when Matomo is enabled.
      }
   },
   analytics: {
      activate: function() {
         // Do stuff to enable Google Analytics. See best practices below.
      },
      fallback: function() {
         // Do stuff to fallback. E.g. display layer where the benefits are explained,
         // when Google Analytics is enabled.
      }
   }
}

/**
 * Entry to your custom code:
 * Catch the Event 'cookiesjsrUserConsent' that comes with an object services inside the
 * event object called with event.detail.services. It contains the current user decisions.
 *
 * This event is fired when DOM is loaded or user updates his settings.
 */
document.addEventListener('cookiesjsrUserConsent', function(event) {
   var services = (typeof event.detail.services === 'object') ? event.detail.services : {};
   for (var sid in services) {
      if(typeof dispatcher[sid] === 'object') {
         if(services[sid] === true && typeof dispatcher[sid].activate === 'function') {
            dispatcher[sid].activate();
         } else if(typeof dispatcher[sid].fallback === 'function') {
            dispatcher[sid].fallback();
         }
      }
   }
});

````
### <a name="docs-config"></a> Documentation ```cookiesjsr-config.json```

In the config file are two objects expected: ```config```, ```services``` and optinal ```translation```.

#### The config object
In ```config``` you define some options about the
1. ```interface```: Some common option about
   - where to find the translation,
   - how to display the cookie consent widget.
   - ... and more
2. ```cookie```: The users decisions what cookies will be allowed or not, are saved in another 'required' cookie. Here
   you define the properties for this single cookie.
3. ```callback```: Each time the user saves changes of his cookie settings, a callback can be invoked, sending these
   data to the backend.

| Parent      | Children     | Type                                                    |
|-------------|--------------|---------------------------------------------------------|
| config      |              | object                                                  |
|             | cookie       | object \(keys: name, expires, sameSite, secure\)        |
|             | callback     | object \(keys: method, url, headers\)                   |
|             | interface    | object \(keys: openSettingsHash, \.\.\.\)               |
| services    |              | object ([see docs here](#services-object))              |
| translation |              | object, optional ([see docs here](#translation-object)) |

##### Details
| Parent       | Children         | Type: Description                                |
|--------------|------------------|--------------------------------------------------|
| cookie       |                  |                                                  |
|              | name             | string: the cookie name                          |
|              | expires          | integer: (optional) time (ms) cookie is valid.   |
|              | domain           | string: (optional) domain cookie is valid for.   |
|              | path             | string: (optional) path cookie is valid for.     |
|              | secure           | boolean: (optional, default: false)              |
|              | sameSite         | string: (optional, None/Lax/Strict, default: Lax)|
| callback     |                  | ```docs see section "Callback" below```          |
|              | url              | string: (optional) the callback url              |
|              | method           | string: (optional, get/post, default: get)       |
|              | headers          | object: (optional), key-value pairs              |
| interface    |                  |                                                  |
|              | openSettingsHash | string: (optional, default: cookiesjsr) The location.hash value to open the cookie settings dialog. |
|              | showDenyAll      | boolean (optional, default: true) Add "deny all" button to dialog that makes all cookies forbidden. |
|              | translationQuery | string (optional, path/url) the absolute path or url where translation data can be load. ("%lang_id" is placeholder for language ID ISO 639-1 e.g. "en". This option you can use, when you use static translation files. You can also [add the translation to your config-file](#translation-config). |
|              | availableLangs   | array(string(2)): language IDs ISO 639-1 e.g. ["en", "de"] |
|              | defaultLang      | string(2): (optional, default: en) Fallback language, if requested language not available |
|              | groupConsent     | boolean: (optional, default: false) The user can only en-/disable entire groups not individual services. Services are not shown in detail. |
|              | cookieDocs       | boolean: (optional, default: false) Display links to cookie documentation where explicitly is described what 3rd-party services and cookies are used. This is required, if you use groupConsent. Link and link text are provided by translation. |

#### <a name="services-object"></a> The services object

The ```services``` object is a simple homogeneous structure of multiple service groups containing the services that users have to accept or deny.

```json
{
   "services": {
      "group_1": {
         "id": "group_1",
         "services": [{"service_1": "..."}, {"service_2": "..."}, {"...": "..."} ]
      },
      "group_2": {
         "...": "..."
      }
   }
}
```
Each contained service in a group has 5 properties:

| Property     | Type         | Description                                      |
|--------------|--------------|--------------------------------------------------|
| key          | string (uid) | The unique Id of the service. e.g. "gtag"        |
| type         | string       | Group the service belongs to.                    |
| name         | string       | Display name shown in the dialog widget          |
| uri          | string       | URL for the ext. documentation of the resource.  |
| needConsent  | string       | If service needs users consent or not (required cookies) |


#### <a name="translation-object"></a> The ```translation``` object

The content of this object is just the same as the [content of a translation file](./lang/en/translation.json).

<a name="translation-config"></a>If the translation from a CMS or similar the translation can also be included in the config file.
In this case, the path to the config file must contain a placeholder for the language ID (% lang_id).

However, you have to decide how you want to load the translation. A good option is to load static files as they are
offered here in the Git repo. In this case, simply adjust the path where the files are stored at
```config.interface.translationQuery```.

If the translations are to be maintained via a CMS or similar, it can be advantageous to deliver the translation with
the configuration, because otherwise two API calls will be executed in succession, which can delay the display of the
app. To achieve that the config delivers the correct translation you will have to provide a translation parameter in the
configQuery route (see paragraph below).

However, IF a translation object is included in the config, the translationQuery will not be invoked.

### How the language is determined?
`````html
<html lang="de">
`````

By the way: The app determines the language based on the lang parameter in the HTML tag. If no parameter is available,
the default language of the browser is determining.

## <a name="base-config"></a>Base Config
Content of your ```cookiesjsr-init.js```:
````js
// Base configuration 
document.cookiesjsr = {
   apiUrl: '',
   configQuery: '/path/to/your/cookiesjsr-config.json'
}
````
The base config tells the library where to find the config. If the config is load from an other domain, you must give
an apiUrl (leave empty if not).

```apiUrl```: (optional, e.g. 'https://hi-api.io/path') The base URL where your API can be reached. Leave empty if your
website has same origin. No pending slash.

```configQuery```: (required) Path to your config-file (cookiesjsr-config.json).
If your config-file contains the translation data, the path must include a param "%lang_id" for the language id.
````
configQuery: '/path/to/%lang_id/cookiesjsr-config.json'
````

## <a name="service-activation"></a>Processing consent, activation of 3rd-party services

In the [code example above](#manage-event) you see how to catch the event and distribute the users consents to the
individual service activation. Here we want to have a look on how to handle the 3rd-party service activation. The
content of the functions provided in the dispatcher event (activate and fallback).

In order to effectively suppress 3rd party cookies, the resources must already be switched off in the supplied source
code. I.e. that corresponding script tags or iframes (these are the most common use cases) have to be manipulated so
that they do not work. => We have to find a reversible knock-out technique.

What the ```activate()``` function has to do is to reanimate the service.

What the ```fallback()``` function has to do is to repair gaps in the layout, inform user, that something is missing, or
ask again if he now wants to activate the service.

### Reversible knock-outs for ```<script>``` and ```<iframe>```
`````html
<!-- before -->
<script src="https://ext-service.net/js/install_many_cookies.js"></script>
<!-- after (knocked out javascript) -->
<script src="https://ext-service.net/js/install_many_cookies.js" data-sid="extservice" type="text/plain"></script>

<!-- before -->
<iframe src="https://www.youtube.com/embed/XGT82nnmF4c" width="560" height="315"></iframe>
<!-- after (knocked out iframe) -->
<iframe src="/path/to/myIframeFallback.html" data-sid="youtube" data-src="https://www.youtube.com/embed/XGT82nnmF4c" width="560" height="315"></iframe>
`````

### Re-animation of knocked out services

````js
var dispatch = {
   extservice: {
      activate: function() {
         jQuery('script[data-sid="extservice"]').each(function() {
            var replacement = jQuery(this).clone().removeAttr('type');
            jQuery(this).replaceWith(replacement.html());
         });
      },
      fallback: function() {
         // No need.
      }
   },
   youtube: {
      activate: function() {
         jQuery('iframe[data-sid="youtube"]').each(function() {
            jQuery(this).attr('src', jQuery(this).data('src'));
         });
      },
      fallback: function() {
         jQuery('iframe[data-sid="youtube"]').parent().prepend(jQuery('<div>Sorry, but YouTube disabled.</div>'))
      }
   }
}
````

## En-/disable 3rd-party services from anywhere

It is possible to activate third party services from anywhere on the website. It is not necessary to open the cookie
widget for this. It just has to be fired a Javascript event ```cookiesjsrSetService```.

Suppose you have a link on the page that should be used to activate the Matomo service...

````html
<a href="#enable-matomo" id="cookiesjsr-enable-matomo">Enable matomo</a>
````
... your javascript could look like this.

````js
var element = document.getElementById('cookiesjsr-enable-matomo');
element.addEventListener('click', function (e) {
   e.preventDefault();
   var options = { services: { matomo: true }};
   document.dispatchEvent(new CustomEvent('cookiesjsrSetService', { detail: options }));
});
````
As you can see, the event expects a data object, which is stored in the detail property of the CustomEvents. This data
object should have at least one of the following properties:

| Property | Value   | Description                         |
|----------|---------|-------------------------------------|
| all      | boolean | En-/disables all 3rd-party services |
| services | object  | An object with key/value-pairs where the ```key``` is the id of a 3rd-parts service and ```value``` is a boolean if the service should be enabled (true) or disabled (false). |
| groups   | object  | An object with key/value-pairs where the ```key``` is the id of a entire group of services and ```value``` is a boolean if the services should be enabled (true) or disabled (false). |


## Callback
If you have defined a callback URL, this will be called (to your backend or wherever you want) immediately after the cookiesjsr cookie was set or updated. When you send a POST request, the answer of the callback should be a JSON response. The returned data is available in a JS event.
The following code is required to process the returned data.

````js
document.addEventListener('cookiesjsrCallbackResponse', function (event) {
  // process returned data in frontend here.
  console.log(event.detail.response);
});
````

## Styling

If you just want to customize colors use css vars. Copy the following code to your css and play with the values.

You shouldn't have any trouble overwriting the css. The CSS is plain BEM-style and there are no "!importants" or
inline-styles.


```html
<style>
   body #cookiesjsr {
      --default-margin: 1.25em;
      --font-size-reset: 1rem;

      --btn-font-color: #FFF;
      --btn-border-color: #FFF;
      --btn-bg-color: #004c93;
      --btn-prime-font-color: #004c93;
      --btn-prime-border-color: #FFF;
      --btn-prime-bg-color: #FFF;
      --btn-inv-font-color: #004c93;
      --btn-inv-border-color: #004c93;
      --btn-inv-bg-color: #FFF;
      --btn-prime-inv-font-color: #FFF;
      --btn-prime-inv-border-color: #004c93;
      --btn-prime-inv-bg-color: #004c93;

      --link-list-font-color: #FFF;
      --link-list-separator-color: #FFF;

      --banner-logo-offset: 100px;
      --banner-bg-color: #004c93;
      --banner-font-color: #FFF;

      --layer-header-height: 3.5em;
      --layer-header-bg-color: #FFF;
      --layer-header-font-color: #000f37;
      --layer-body-bg-color: #FFF;
      --layer-tab-bg-color: #FFF;
      --layer-tab-font-color: #000f37;
      --layer-tab-active-bg-color: #004c93;
      --layer-tab-active-font-color: #FFF;
      --layer-bg-dark: #004c93;
      --layer-font-light: #FFF;
      --layer-font-dark: #000f37;
      --layer-border-color: #e4e5e6;
      --layer-footer-bg-color: #FFF;
      --layer-footer-font-color: #000f37;
      --layer-footer-height: 4.5em;

      --switch-border-color: #e4e5e6;
      --switch-handle-color: #FFF;
      --switch-bg-off: #FFF;
      --switch-bg-on: #00AA00;
      --switch-width: 45px;
      --switch-height: 20px;
      --switch-always-on-font-color: #00AA00;
      --switch-always-on-bg-color: #FFF;
   }
</style>
```

### Rewrite CSS

The original .scss files are in the repo. If you want to do a full CSS rewrite, this might be a good starting point.
In that case, you can simply do without integrating the original CSS.

The MarkUp is fixed because the JS is a rendered React-App. You can't change anything here.
