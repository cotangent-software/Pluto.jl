<h1><img alt="PlutoLab.jl" src="https://raw.githubusercontent.com/cotangent-software/PlutoLab.jl/master/frontend/img/logo.svg" width=354 height=74 ></h1>

# Powered by [Pluto.jl](https://github.com/fonsp/Pluto.jl), inspired by [JupyterLab](https://github.com/jupyterlab/jupyterlab)

Much of Pluto's interface is designed to be as simple as possible to make scientific computing less intimidating. PlutoLab is built entirely around Pluto, but is meant to offer more complex features while sacrificing some simplicity. By no means is this project attempting to become a replacement of Pluto but rather an extension of it, much like the interaction between Jupyter notebooks and Jupyter lab (hence the name PlutoLab).

## Design Goals
The end goal of PlutoLab.jl is to become something resembling an IDE for Julia-based scientific computing. As such, the following design principles are core to the development of PlutoLab:
* **Familiarity** - Stay true to some of the original goals of Pluto while incorporating features of IDEs
* **Extendability** - Open the interface to extensions which can further modify PlutoLab's behavior
* **Configurability** - Accommodates the wide variety of use cases under scientific computing

## Current Progress
As of now the project is largely in its infancy. Much of the current frontend is written in [Preact](https://github.com/preactjs/preact) (with [htm](https://github.com/developit/htm)) as to circumvent build processes. The goal is to ultimately port the existing code to [React](https://github.com/facebook/react) / [create-react-app](https://github.com/facebook/create-react-app).

The file exploration pane is nearing completion, and the project functions as a way to edit multiple Pluto notebooks at the same time in the same window right now.

## Future Directions
* *Integrated Julia REPL*
* *Text editor* / *Binary editor*
* *Version control GUI*
* *Extension marketplace*
* *Distributed computing GUI*
* *Real-time multi-user editing*

## How you can help!
Feel free to contact me or create an issue with any feature requests, ideas, bugs, questions, etc. They help me figure out what to develop next! Code contributions are greatly appreciated as well (check out the [contributing guidelines](CONTRIBUTING.md)).

## Installation
**NOTE**: The repository is likely unstable at this point in time and is not recommended for non-developmental use.

Run Julia and add the package:
```
julia> ]
(v1.15) pkg> add https://github.com/cotangent-software/PlutoLab.jl
```

To run the notebook server:
```
julia> import PlutoLab
julia> PlutoLab.run(; **kwargs)
```
Check the [contributing guidelines](CONTRIBUTING.md) for possible values of **kwargs. Upon official release no kwargs will be necessary, but they may be necessary for starting the server in development versions.
