# Cookies JSR

Easy plug-able cookie consent management tool. 

* Allows GDPR conform cookie consent management.
* Supports translation.
* Allows custom styling. 

## Install

1. Create your ```cookiejsr-config.json``` file where you define your groups and services.
2. Create your ```cookiejsr-init.js``` file where you initialize the services.
3. Place the following HTML before the closing body-tag.

... and you are done.

```html
<html lang="de">
<head>
  ...
  <link rel="stylesheet" media="screen" href="https://cdn.jsdelivr.net/gh/jfeltkamp/cookiejsr@0/dist/cookiejsr.min.css">
</head>
<body>
  ...

  <!-- The Place where cookiesjsr can live in. -->
  <div id="cookiesjsr"></div> 
  <script src="/path/to/your/cookiejsr-init.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/jfeltkamp/cookiejsr@0/dist/cookiejsr.min.js"></script>
</body>
</html>
``` 

### Example ```cookiejsr-config.json```
(Docs below)
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

In the config file are two objects expected: ```config``` and ```services```.
#### The config object
In ```config``` you define some options about the 
1. ```interface```: Some common option about 
   - where to find the translation,
   - how to display the cookie consent widget.
   - ... and more
2. ```cookie```: The users decisions what cookies will be allowed or not, are saved in another 'required' cookie. Here you define the properties for this single cookie. 
3. ```callback```: Each time the user saves changes of his cookie settings, a callback can be invoked, sending these data to the backend.

| parent | child        | type                                             |
|--------|--------------|--------------------------------------------------|
| config |              | object                                           |
|        | a. cookie    | object \(keys: name, expires, sameSite, secure\) |
|        | b. callback  | object \(keys: method, url, headers\)            |
|        | c. interface | object \(keys: openSettingsHash, \.\.\.\)        |

##### Details
| parent       | child        | type: description                                |
|--------------|--------------|--------------------------------------------------|
| a. cookie    |              |                                                  |
|              | name         | string: the cookie name                          |
|              | expires      | integer: (optional) time (ms) cookie is valid.   |
|              | domain       | string: (optional) domain cookie is valid for.   |
|              | path         | string: (optional) path cookie is valid for.     |
|              | secure       | boolean: (optional, default: false)              |
|              | sameSite     | string: (optional, None/Lax/Strict, default: Lax)|
| b. callback  |              |                                                  |
|              | url          | string: (optional) the callback url              |
|              | method       | string: (optional, get/post, default: get)       |
|              | headers      | object: (optional), key-value pairs              |
| c. interface |              |                                                  |
|              | openSettingsHash | string: (optional, default: cookiesjsr) The location.hash value to open the cookie settings dialog. |
|              | showDenyAll      | boolean (optional, default: true) Add "deny all" button to dialog that makes all cookies forbidden. |
|              | translationQuery | string (path/url) the absolute path or url where translation data can be load. ("%lang_id" is placeholder for language ID ISO 639-1 e.g. "en" |
|              | availableLangs   | array(string(2)): language IDs ISO 639-1 e.g. ["en", "de"] |
|              | defaultLang      | string(2): (optional, default: en) Fallback language, if requested language not available |

#### The services object

The ```services``` object is a simple homogeneous structure of multiple service groups containing the services that users have to accept or deny. 

```json
{
    "services": {
      "group_1": {
        "id": "group_1",
        "services": [{...service_1}, {...service_2}, ... ]
      },
      "group_2": {
        ...
      },
    }
}
```
Each contained service in a group has 5 properties:

| Property     | type         | description                                      |
|--------------|--------------|--------------------------------------------------|
| key          | string (uid) | The unique Id of the service. e.g. "gtag"        |
| type         | string       | Group the service belongs to.                    |
| name         | string       | Display name shown in the dialog widget          |
| uri          | string       | URL for the ext. documentation of the resource.  |
| needConsent  | string       | If service needs users consent or not (required cookies) |

### Example ```cookiejsr-init.js```

````js
document.cookiesjsr = {
  apiUrl: '',
  serviceQuery: '/path/to/your/cookiejsr-config.json',
  activeGroup: 'default'
}

var dispatcher = {
  matomo: {
    activate: function() {
      // Do stuff to enable Matomo.
    },
    fallback: function() {
      // Do stuff to fallback. E.g. display layer where the benefits are explained,
      // when Matomo is enabled.
    }
  },
  analytics: {
    activate: function() {
      // Do stuff to enable Google Analytics.
    },
    fallback: function() {
      // Do stuff to fallback. E.g. display layer where the benefits are explained,
      // when Matomo is enabled.
    }
  }
}

/**
 * Entry to your custom code:
 * Catch the Event 'cookieConsent' that comes with an object services inside the
 * event object called with event.detail.services. It containes the current user decisions.
 * This event is fired when DOM is loaded or user updates his settings. 
 */
document.addEventListener('cookieConsent', function(event) {
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

## Styling

If you just want to customize colors use css vars.

Copy the following code to your css and play with the values.

```html
<style>
  body .cookiesjsr {
    --ci-blue: #004c93;
    --ci-dark: #000f37;
    --ci-light: #FFF;
    --ci-bg-light: #e4e5e6;
    
    --default-margin: 1.25rem;
    
    --btn-font-color: #FFF;
    --btn-border-color: #FFF;
    --btn-bg-color: #004c93;
    
    --banner-logo-offset: 100px; // Mobile layout keeps space free to not overlap your logo.
    --banner-bg-color: #004c93;
    --banner-font-color: #FFF;
    --banner-link-font-color: #FFF;
    --banner-btn-font-color: #FFF;
    --banner-btn-border-color: #FFF;
    --banner-btn-bg-color: #004c93;
    
    --layer-bg-light: #FFF;
    --layer-bg-dark: #004c93;
    --layer-font-light: #FFF;
    --layer-font-dark: #000f37;
    --layer-border-color: #e4e5e6;
    --layer-title-color: #000f37;
    --layer-header-height: 3.5rem;
    --layer-footer-height: 4.5rem;
    
    --switch-border-color: #e4e5e6;
    --switch-handle-color: #FFF;
    --switch-bg-off: #FFF;
    --switch-bg-on: #00AA00;
    --switch-width: 45px;
    --switch-height: 20px;
  }
</style>
```

kjhsdfkjh
