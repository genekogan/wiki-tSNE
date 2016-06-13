### wiki-tSNE

This IPython notebook will show you how to cluster and visualize a set of documents, articles, or texts as in [this demo](http://www.genekogan.com/works/wiki-tSNE). The included example clusters a set of Wikipedia articles, which is this list of [political ideologies](https://en.wikipedia.org/wiki/List_of_political_ideologies).

The notebook derives a clustering by first converting a set of documents into a [tf-idf matrix](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) which is a representation of each document as a vector in which each element represents the relative importance of a unique term to that document. Using that representation, we can reduce its dimension to 2 using [t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding), and then save it to a json file.

The folder `visualize` contains a [p5.js](http://www.p5js.org) sketch which displays the results in a browser after adjusting the t-SNE coordinates slightly so as to avoid overlaps/collisions of words. More info in the scripts.