# [![Clash Royale Card Maker](https://projects.dabolus.com/cr-card-maker/header.svg)](https://beta.clashroyalecardmaker.com)

The second version of the [Clash Royale Card Maker](https://www.clashroyalecardmaker.com), completely rewritten from scratch.

##### Why creating a new version from scratch?
Even if it has been updated and bugfixed later on, the original Card Maker was written in just three days.
No build tools were used, everything was handwritten using [Sublime Text 3](https://www.sublimetext.com/3).
For this reason, it was unoptimized, badly organized and inflexible.

Almost an year later, I felt it was time to finally give the Card Maker a proper organization.
After many attempts on building a scalable, optimized website, I finally came up with this.
The main points of the CRCM 2.0 are:
- Built using [WebComponents](https://www.webcomponents.org/) to be as much modular as possible. Adding new features is incredibly easy!
- Card generation is much closer to the original Clash Royale cards. Most of the text on the card auto fits and you can also add newlines to the card description and edit and rearrange the card properties (finally!)
- The card is directly editable. No side form or anything else. Just tap what you want to edit an do whatever you want
- [Polymer CLI](https://www.polymer-project.org/2.0/docs/tools/polymer-cli) to test and build the project
- [Bower](https://bower.io/) to manage the project dependencies
- Less external libraries, much lighter and faster
- A more minimal and appealing UI
- Built as a [Progressive Web App](https://developers.google.com/web/progressive-web-apps/): installs a [service worker](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers) that caches all the assets, so it is even faster after the first time you use it (and it can also be installed as a normal app!)
- **Open-source!**

_Note: I know Bower is deprecated, but for now the most stable version of Polymer and all of its dependencies are only available there. I will switch to yarn as soon as Polymer 3 comes out._

## Run it locally and/or contribute
Install the latest version of bower:
```bash
$ yarn global add bower
# or
$ npm i -g bower
```
Install the Polymer CLI:
```bash
$ yarn global add polymer-cli
# or
$ npm i -g polymer-cli
```
Clone the repository:
```bash
$ git clone https://github.com/Dabolus/cr-card-maker.git && cd cr-card-maker
```
Finally, install the dependencies using Bower:
```bash
$ bower install
```

Now everything is set up and ready! These are the available commands:
```bash
$ polymer serve     # Serves the CRCM on localhost:8081
$ polymer build     # Builds the CRCM and copies the built files to the 'build/' folder.
```
The `build` command will create three different builds:
- `es5-bundled`: The JS code is transpiled to ES5 and the dependencies are bundled
- `es6-bundled`: The JS code is left as-is (ES6) and the dependencies are bundled
- `es6-unbundled`: The JS code is left as-is (ES6) and the dependencies are **NOT** bundled

**Optional:** if you contribute to this project and you want to be credited:

1. Edit `package.json` by **adding** yourself into the `contributors` field, e.g.
   ```JSON
   {
     "contributors": [{
       "name": "Your name",
       "email": "your.email@example.com",
       "url": "your-website.example.com"
     }]
   }
   ```
2. Edit `humans.txt` by **adding** yourself into the `THANKS` field, e.g.
   ```
   /* THANKS */
       Your role: Your name
       Site: your-website.example.com
       Contact: your.email [at] example.com
       From: Your country
   ```

Enjoy!
