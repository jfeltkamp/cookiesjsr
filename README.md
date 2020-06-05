# Cookies JSR

Easy plug-able cookie consent management tool. 

* Allows GDPR conform cookie consent management.
* Supports translation.
* Allows custom styling. 

## Install

1. Create your ```cookiejsr-config.json``` file where you define your groups and services.
2. Create your ```cookiejsr-init.js``` file where you initialize the services.
3. Place the following HTML before the closing body-tag.

```html
<html lang="de">
<head>
  ...
  <link rel="stylesheet" media="screen" href="https://cdn.jsdelivr.net/gh/jfeltkamp/cookiesjsr@0/dist/cookiejsr.min.css">
</head>
<body>
  ...

  <!-- The Place where cookiesjsr can live in. -->
  <div id="cookiesjsr"></div> 
  <script src="/path/to/your/cookiejsr-init.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/jfeltkamp/cookiejsr@0/dist/cookiesjsr.min.js"></script>
</body>
</html>
``` 


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
