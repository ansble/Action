#Action!
![build status](https://travis-ci.org/designfrontier/Action.svg)

`Action!` is a front end sub/pub based framework for event based development. No more passing around dependencies, no more worrying about timing. Events free you to build apps that function they way the real world does: cause and effect.

Need data? Ask for it. Need to do something with that data? Listen for when it is sent back to you and do it. Need to watch for the user to do something? Listen for it and react accordingly. `Action!` embraces the asynchronicity that is the world around us to create better front end experiences and code.

###TODOs
Are now located in the issues section where they are easier to manage and align with milestones.

#### Release Names
We'll use these folks as release names: http://en.wikipedia.org/wiki/List_of_action_film_actors

in order from top left - down the column then on to the next column. If we run out we'll add more names to the list :-)

##Documentation
This is really really loose and rudimentary, but it is now here. It will expand out over time. If you want more details about the API the tests, and code is probably your best bet.

###action.eventMe()
This is a functional constructor that adds events to an object. It provides a global, and local, listener and emitter.

###action.modelMe()
This is a functional constructor that creates a model object with private attributes (accessible through get() and set()), events, ajax, etc.

###action.routeMe()
Route events and support for yoru application

###action.clone()
A clone function that copies an object without preserving references

###action.compose()
A function for composition with

###action.Error
Error constructor prototype

###action.viewMe()
The view constructor function for view objects... more to come

###Browser Support
0. IE 9+
0. Chrome
0. Firefox
0. Opera?

###Dependencies
There are a few dependencies for Action to be a fully useful framework. They are (with the reasons for them):
0. localForage (If you want to use the local cache. It will automatically cache all of your ajax GET requests in local storage and pull from them all subsequent times they are requested)
0. Handlebars, or compatible (a templating library)

##Changelog
Can be found in the History.md file... generated with:
git log `git describe --tags --abbrev=0`..HEAD --pretty=format:"  * %s" > History_temp.md

##Next Version Roadmap

v0.7.0 Adam Baldwin

A more complete form of this list is availble [here.](https://github.com/designfrontier/Action/milestones/v0.7.0%20Adam%20Baldwin)

* ~~break into commonjs components for more encasulated development and generate with browserify~~
* expand testing
* ~~rework the view system to be peer updated and more powerful~~
* revise routing and write routing tests
* ~~add a data:change event to compliment data:set and get events~~
* more code modernization and updates (whatever gets done in the process of meeting other milestones)

v0.8.0 Aaron Kwok

