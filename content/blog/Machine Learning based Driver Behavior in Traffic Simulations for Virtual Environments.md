tags: [virtual environments, traffic simulation, machine learning]
type: blog-post
category: blog
datetime: 2013-06-10 00:00:00
title: Machine Learning based Driver Behavior in Traffic Simulations for Virtual Environments
summary: Learning driving behavior with neural networks, has the potential to improve traffic simulations for virtual environments, caused by the complexity of human behavior and decision making processes, which is implicitly represented by and trainable from the drivers actions.<br />This work, describes methods to face this challenge and examines dependencies between model parameters and various performance values.<br />An exemplary simulation environment is described and based on this, a large amount of different neural network and dataset configurations were tested and evaluated
---

Introduction
============

This project is part of the AVeSi[^1] project. The goal of AVeSi is to develop a realistic traffic simulation including the simulation of traffic participants (agents) with personality profiles. These profiles should contain aspects like individual risk propensities and individual behaviors.

It is a difficult task to simulate such realistic behavior, which is expressed by an agent’s actions in arbitrary situations (simulation states). One reason for this difficulty is the large amount of possible states. Another is the unpredictability of and variations in behavior of real-world human drivers.

Common approaches to simulate road traffic agents use rule-based state machines, which become complex and hard to develop for realistic agents. Another important drawback is the insufficient adaption to disregarded situations.

Another option is the application of machine learning to this task, which is explained in Chapter [cap:state~o~f~a~rt]. This methodology has also been used to control movement, aiming and weapon switching of a non-player character (bot) in a multiplayer first person shooter game @Bauckhage2004-TAF@Bauckhage2003-LHL@Thurau2003-CSO.

The goal of this project is to develop such agents with machine learning methods. More general it is to investigate, which methods and which parameters are adequate to learn behavior for traffic simulations. In chapter [cap:state~o~f~a~rt], the methods and their adjusting screws are explained, that are the foundation of the further experiments.

These experiments are realized on a framework which was developed for this project. It contains methods and tools for gathering datasets, which contain human driving behavior, for creating and training of neural networks in a wide range of configurations and tools for testing and evaluating them. This tools, materials and methods are topic of chapter [chap:methods].

At the chosen approach, a human driver controls a vehicle in the traffic simulation and in this way generates a dataset, which contains samples of the current simulation state and the related action. To a certain extend, this dataset then contains the driver’s personality and knowledge about the environment. It can be used to be learned, for example by a neural network @haykin2008neural and could be used to test the learning performance. After training, the network’s response to the state-vectors is meant to be used to control vehicles in the simulation. The agent’s behavior in the simulation can be scored and compared for evaluation purposes, which explained and used in chapter [chap:eval]. Finally in chapter [chap:conclusion], a conclusion of the results and some thoughts of further work is given.

State of the Art
================

[cap:state~o~f~a~rt]

From a mathematical perspective, the task of driving a vehicle can be understood as a transition from the environment’s state $ \vec{s} $ to the driver’s action $ \vec{a} $. The state vector contains all information of the driver’s memory and his sensory perceptions. The action vector contains the signals which are sent to the driver’s muscles. The signature of such a function is $ f_{drive}: \mathbb{R}^i \rightarrow \mathbb{R}^z $. For a real human, it is practically impossible to get a correct definition of $ f_{drive} $, but on a higher level, the complexity can be reduced to certain quantifiable vector components. The action vector can be reduced to the interaction interface with the environment. Those vector components, are called *features*. The feature selection for this project is described in section [sec:method:features].

To simulate the driver behavior among the requirements for realism, a possible approach is to approximate such a driving function of a human driver by a neural network. The reason for choosing the method of neural networks as an alternative approach to simulate driver behavior can be found in the explanation of neural networks by Simon Haykin:

> "Work on artificial neural networks, commonly referred to as "neural networks", has been motivated right from its inception by the recognition that the human brain computes in an entirely different way from the conventional digital computer. The brain is a highly *complex, nonlinear, and parallel computer* (information processing system). It has the capability to organize its structural constituents, known as *neurons*, so as to perform certain computations (e.g. pattern recognition, perception, and motor control) many times faster than the fastest digital computer in existence today. Consider, for example human *vision*, which is an information processing task. It is the function of the visual system to provide a *representation* of the environment around us and, more important, to supply the information we need to *interact* with the environment. @haykin2008neural [, 31]"

Since driving a car consists in general of information processing and motor control, the method of neural networks has the potential to fit the needs. To profit from this potential, the chosen method is, to use an abstract model of a human brain regarding to @haykin2008neural [, 40-45], which is defined in section [sec:art:nn]. As a human brain evolves his performance by observing or relating causes and effects, artificial neural networks need to be trained. Learning-methods and algorithms are described in section [sec:art:learning].

Artificial Neural Networks
--------------------------

[sec:art:nn]

As described before, a transition from an input $ \vec{s} $ to an output $ \vec{a} $ is necessary. To compute this transition using artificial neural networks, a well defined model, like the following, is required. A neural network is a signal flow graph, consisting of nodes, which are called *neurons*, and weighted directed edges, which are called *synapses*. Every neuron $ n_{i, j} $ has a set of incoming synapses and an output value $ y_{i, j} $. Every synapse brings a signal $ x_{i, j, k} $ and has a synaptic weight $ w_{i, j, k} $. This signal equals the value of $ y $ of the neuron, where this synapse is an outgoing edge. From this it follows that each neuron has set of incoming signals $ \{ x_{i, j, 1}, x_{i, j, 2}, \dots, x_{i, j, m_{i, j}} \} $.

Further, there are three types of neurons. The input neurons, the output neurons and the hidden neurons. Depending on the neuron type, the definition of $ y_{i, j} $ differs, which the following equations and paragraphs describe.

$$\begin{aligned}
    y_{0, j}    = & \varphi_{0, j}(s_j)                                     \label{eq:neuron:in}\\
    v_{i,j} = & b_{i, j} + \sum_{k=1}^{m_{i, j}}{x_{i, j, k} w_{i, j, k}}           \label{eq:neuron:field}\\
    v_{i,j} = & \sum_{k=0}^{m_{i, j}}{x_{i, j, k} w_{i, j, k}}  \; , \; x_{i,j,0} = 1   \label{eq:neuron:biased_field}\\
    y_{i, j}    = & \varphi_{i, j}(v_{i,j})                                     \label{eq:neuron:hidden}\\
    a_j         = & y_{z, j}                                            \label{eq:neuron:out}\end{aligned}$$

Every input neuron $ n_{0, j} $ is associated with a component of the global input vector $ \vec{s} $, as shown in equation [eq:neuron:in] and has no incoming synapses. Hidden neurons and output neurons accumulate the output value of other neurons, which are connected and weighted by the synapses, as shown in equation [eq:neuron:field]. Every output neuron $ n_{z, j} $ is associated with a component of the global output vector, as shown in equation [eq:neuron:out].

The function $ \varphi_{i, j} $ is called *activation function* and its purpose is to ensure a certain value range and significance of $ y $. Commonly used activation functions are described in section [sec:art:act~n~orm]. Finally, the *bias* $ b_{i,j} $ is used as an offset to the neuron output value. The equation could be simplified, by considering the bias as an additional weight to a neuron with $ y = 1 $, as shown in equation [eq:neuron:biased~f~ield]. All these variables and relations are summarized in figure [img:single~n~euron].

The method to build the desired transition is about to define a network structure by inserting neurons, synapses and activation functions. This structure is sometimes called *architecture* of an neural network and ideally it fits to the model of the system’s environment. Another task is to configure the weights and biases. The process of tuning these parameters to fit the network’s response to an ideal system response is known as *training* and is described in section [sec:art:learning].

​(n) at (1\*6,-1-1\*2) $\sum$; (n label) [above=0.1 of n] $n_{i,j}$;

​(x) at(0\*6,-0\*2)$x_{i,j,0}$; (x) – (n) node [midway,above,draw=none] $w_{i,j,0}$;

​(x) at(0\*6,-1\*2)$x_{i,j,1}$; (x) – (n) node [midway,above,draw=none] $w_{i,j,1}$;

​(x) at(0\*6,-3\*2)$x_{i,j,m_{i,j}}$; (x) – (n) node [midway,above,draw=none] $w_{i,j,m_{i,j}}\quad\;$;

​(x) at (0\*6,-2\*2) $\vdots$;

​(b) at(1\*6,-3\*2)$b_{i,j}$; (b) – (n) node [midway,above,draw=none] ;

​(y) at(2\*6,-1-1\*2)$y_{i,j}$; (n) – (y) node [midway,above,draw=none] $\varphi_{i, j}$;

[img:single~n~euron]

### Feed Forward Neural Networks

[sec:art:ffnn]

Feed forward neural networks constrain the structure of a neural network in some points. The graph must be acyclic and the neurons must be organized in *layers*. That means that every neuron of the same layer $ i $, must have only outgoing synapses to one other layer $ i + 1 $. The example in figure [img:ffnn] illustrates this conditions.

According to the definition of a neuron, the index $ i $ of a neuron $ n_{i,j} $ determines that it belongs to layer $i $. The other index $ j,  0 \leq j \leq l_i $ defines an order on the neurons of one layer. If that layer is an input or an output layer, the neuron corresponds to the $ j $th element of $ \vec{s} $ or $ \vec{a} $. The variable $ l_i $ equals the number of neurons in layer $ i $ and $ z $ is the number of layers.

The number of layers with hidden neurons (*hidden-layers*) effects the ability to extract higher-order statistics from the input, but it increases the complexity of the learning task and the amount of calculation, needed for the network activation @haykin2008neural [, 52].

A feed forward network is *fully connected*, if every node of layer $ i $ is connected to every node of layer $ j $. Otherwise it is a *partially connected* network. The complexity of a neural network and in particular the number of synapses, influences the system’s noise and further the network’s generalization performance.

These constrains guarantee a stable behavior without internal *feedback*. And the condition of disregarding internal feedback simplifies the learning, because at the network activation, the input order has no effect on the output. Furthermore, a potential risk of such feedback loops in neural networks is a behavior of exponential divergence, if the weight of a loop is greater than one @haykin2008neural [, 50]. Besides these drawbacks, the benefit of feedback loops is a kind of internal memory or *short-term-memory*, which could actually improve the performance. Such networks are known as *recurrent neural networks*.

A trade-off is the application of a time discrete memory structure. This is a single-input, multiple-output structure, which extends the input $ \vec{s} $ with time delayed components, as the following equation shows.

$$\begin{aligned}
    \vec{s} \; ' = (    & s_{0, t}, s_{1, t}, \dots, s_{j, t}, \nonumber\\
                & s_{0, t-1}, s_{1, t-1}, \dots, s_{j, t-1}, \nonumber\\
                & \dots,  \nonumber\\
                & s_{0, t-c}, s_{1, t-c}, \dots, s_{j, t-c} )\end{aligned}$$

The order of the memory $ c $ is defined as the amount of input vectors are stored and composed to $ \vec{s} \; ' $. The feed forward network network processes the enhanced input $ \vec{s} \; ' $ as usual @haykin2008neural [, 233-234].

​(a) at(0\*3,-1-0\*2)$n_{0,0}$; (b) at(0\*3,-1-1\*2)$n_{0,1}$;

(0\*3-1.5,-3\*2) – (1\*3-1.5,-3\*2) node [midway,above,draw=none] input layer;

​(c) at(1\*3,-0\*2)$n_{1,0}$; (d) at(1\*3,-1\*2)$n_{1,1}$; (e) at(1\*3,-2\*2)$n_{1,2}$;

​(a) – (c) node [midway,above,draw=none] ; (a) – (e) node [midway,above,draw=none] ;

​(b) – (d) node [midway,above,draw=none] ; (b) – (e) node [midway,above,draw=none] ;

​(f) at(2\*3,-1-0\*2)$n_{2,0}$; (g) at(2\*3,-1-1\*2)$n_{2,1}$;

​(c) – (f) node [midway,above,draw=none] ;

​(d) – (f) node [midway,above,draw=none] ; (d) – (g) node [midway,above,draw=none] ;

​(e) – (f) node [midway,above,draw=none] ;

(1\*3-1.5,-3\*2) – (3\*3-1.5,-3\*2) node [midway,above,draw=none] hidden layer;

​(h) at(3\*3,-1-0\*2)$n_{2,0}$; (i) at(3\*3,-1-1\*2)$n_{2,1}$;

​(f) – (h) node [midway,above,draw=none] ; (f) – (i) node [midway,above,draw=none] ; (g) – (h) node [midway,above,draw=none] ; (g) – (i) node [midway,above,draw=none] ;

(3\*3-1.5,-3\*2) – (4\*3-1.5,-3\*2) node [midway,above,draw=none] output layer;

[img:ffnn]

### Activation and Normalization

[sec:art:act~n~orm]

The choice of the function $ \varphi_{i, j} $, of which several could be used in one network, should depend on the system’s application. As described before, the purpose is to improve the signal’s significance. The functions could be separated by whose necessity of prior domain knowledge. For the state $ \vec{s} $, usually exists information like maximal or minimal values or the standard deviation. Functions, which use these information as arguments are *normalization functions* and some candidates are described regarding to @priddy2005artificial [, 15-17] in section [sec:art:normalization].

On hidden neurons, the values depend on weights, which may change or may complicate the determination of boundaries or distributions. Or some applications may require more simple functions. Common candidates in this case are described in section [sec:art:activation], regarding to @haykin2008neural [, 43-44].

#### Activation Functions

[sec:art:activation]

The identity function $ id $ returns the neuron’s induced local value $ v_{i,j} $ as defined in equation [eq:def:id]. This is common for output neurons, where the value range has to be unlimited and linear.

Common for output neurons in networks for classification tasks is the threshold or heavy-side function as defined in equation [eq:def:threshold]. It returns only one or zero, depending on the value of $ v_{i,j} $. The threshold function is adjustable by the neuron’s bias $ b_{i,j} $

The logistic sigmoid function, defined in equation [eq:def:sigmoid], is differentiable, monotonic and maps the input in the interval $ (0,1) $. Its slope at the point $ v = 0.5 $ is tunable by the value of $ a $. At this point, the function is almost linear, but near the interval limits is highly nonlinear.

In some cases, a value range from $ - 1 $ to $ + 1 $ is beneficial for the networks performance. Then, the signum function (equation [eq:def:signum]) is an alternative to the threshold function and the hyperbolic tangent could replace the logistic sigmoid function, as displayed in figure [img:activation]

$$\begin{aligned}
    id(v)           & = v                   \label{eq:def:id}\\
    threshold(v)    & = 
    \begin{cases}
        1 & v \geq 0 \\
        0 & \text{else}
    \end{cases}                             \label{eq:def:threshold}\\
    sigmoid(v)  & = \frac{1}{1 + exp(-av)}      \label{eq:def:sigmoid}\\
    signum(v)       & =
    \begin{cases}
        1 & v > 0\\
        0 & v = 0\\
        -1 & v < 0
    \end{cases}                         \label{eq:def:signum}\end{aligned}$$

[ group style= group size=2 by 1, xlabels at=edge bottom, ylabels at=edge left , legend pos=south east, no markers, domain=-1.99:1.99, width=7cm, xlabel=v, ylabel=x] gnuplotx; gnuplotx \<= 0 ? 0.0 : 1.0; gnuplot1 / (1 + exp(-x));

gnuplotx; gnuplotx \< 0 ? -1.0 : (x \> 0 ? 1.0 : 0.0); gnuplottanh(x);

[img:activation]

#### Normalization Functions

[sec:art:normalization]

While sigmoid and threshold functions are useful in hidden or output layer neurons, on input neurons, as preprocessing operations, normalization functions could improve the network performance. @haykin2008neural [, 176] The goal of the normalization task is the following:

> "Each input variable should be *preprocessed* so that its mean value, averaged over the entire training sample, is close to zero, or else it will be small compared to its standard deviation. @haykin2008neural [, 177]"

Three useful methods are the min-max-normalization, the z-score and the softmax method. The main differences between these candidates are shown in figure [img:normalization].

A simple option to achieve this goal is the min-max-normalization (see equation [eq:def:minmax]). It requires prior knowledge of the desired range [$ min_v, max_v $] of a feature and performs a linear transformation to the interval $ [0,1] $, if the value of $ v $ is in the desired range.

A similar method is the statistical z-score normalization, as shown in equation [eq:def:zscore]. It is based on the desired mean $ \mu $ and the desired standard deviation $ \sigma $. The advantage is a lesser impact of outliers on the values inside the standard deviation, but the resulting range is $  [-2, 2] $.

Another alternative is the softmax method, which is a simplification and combination of the z-score and the sigmoid functions, as defined in equation [eq:def:softmax]. This leads to an linear shape in the standard deviation and a nonlinear shape towards the range limits for outliers.

$$\begin{aligned}
    minmax(v)   & = \frac{v - min_v}{max_v - min_v}         \label{eq:def:minmax}\\
    zscore(v)   & = \frac{v - \mu}{\sigma}          \label{eq:def:zscore}\\
    softmax(v)  & = \frac{1}{1 + \frac{v - \mu}{\sigma}}    \label{eq:def:softmax}\end{aligned}$$

[ group style= group size=2 by 1, xlabels at=edge bottom, ylabels at=edge left , legend pos=north west, no markers, domain=-1.99:1.99, width=7cm, xlabel=v, ylabel=x] gnuplot"data/norm.dat" using 2;; gnuplot"data/norm.dat" using 3;; gnuplot"data/norm.dat" using 4;;

gnuplot"data/norm.dat" using 5;; gnuplot"data/norm.dat" using 6;; gnuplot"data/norm.dat" using 4;;

[img:normalization]

The Learning Procedure
----------------------

[sec:art:learning]

As previously described, learning in neural networks is about tuning its free parameters. This can be categorized into *supervised learning*, *reinforcement learning* and *unsupervised learning* @haykin2008neural [, 64-67].

In supervised learning, some instance knows the correct output to a given input or at least a subset of all associated vectors. The task is then, to activate the network with some input values to compare the network’s output with the desired output and to adjust the parameters to reach a lower output difference, often after many iterations, as shown in figure [img:learning:supervised]. This is a classical optimization problem. Usually the knowledge, the input and output samples, are available before the network is applied to the system environment. Then the network will be trained with the dataset before its application.

If no previous dataset is available, the system requires a method to rate its performance or calculate the cost of a response. In this case, the procedure is to activate the network, rate the result, tune the network, activate it again with the same input and choose the configuration with the better performance, as displayed in figure [img:learning:reinforcement]. In doing so, the network explores the environment and builds it own model. This is an reinforcement learning method and because the system response is fed back to the environment, it could influence the future behavior.

Unless some input, optimal response nor a cost function is available, this is an unsupervised learning task. Then the system has to detect patterns in the input data autonomously (figure [img:learning:unsupervised]).

Because of the goal to mimic the driving behavior of a real human, the optimal system response is known, or at least, it can be measured. This is a supervised learning task and so, this project will focus on this kind of learning.

(environment) at (0 \* 6, 0 \* -2) $ Environment $; (teacher) at (1 \* 6, 0 \* -2) $ Teacher $; (system) at (0 \* 6, 1 \* -2) $ System $; (error) at (1 \* 6, 1 \* -2) $ \Sigma $;

(environment) – (system) node [midway,right,draw=none] input; (environment) – (teacher) node [midway,above,draw=none] input;

(teacher) – (error) node [midway,left,draw=none] $ + $ optimal output; (system) – (error) node [midway,above,draw=none] $ - $ response;

(error) – (1 \* 6, 1.5 \* -2) node [midway,above,draw=none] ; (1 \* 6, 1.5 \* -2) – (0 \* 6, 1.5 \* -2) node [midway,above,draw=none] error; (0 \* 6, 1.5 \* -2) – (system) node [midway,above,draw=none] ;

[img:learning:supervised]

(environment) at (0.5 \* 6, 0 \* -2) $ Environment $; (teacher) at (1.5 \* 6, 1 \* -2) $ Critic $; (system) at (0.5 \* 6, 1 \* -2) $ System $;

(environment) – (system) node [midway,right,draw=none] input; (environment) – (1.5 \* 6, 0 \* -2) node [midway,above,draw=none] input; (1.5 \* 6, 0 \* -2) – (teacher) node [midway,above,draw=none] ;

(system) – (teacher) node [midway,above,draw=none] response; (system) – (0 \* 6, 1 \* -2) node [midway,above,draw=none] ; (0 \* 6, 1 \* -2) – (0 \* 6, 0 \* -2) node [midway,right,draw=none] response; (0 \* 6, 0 \* -2) – (environment) node [midway,above,draw=none] ;

(teacher) – (1.5 \* 6, 1.5 \* -2) node [midway,above,draw=none] ; (1.5 \* 6, 1.5 \* -2) – (0.5 \* 6, 1.5 \* -2) node [midway,above,draw=none] cost; (0.5 \* 6, 1.5 \* -2) – (system) node [midway,above,draw=none] ;

[img:learning:reinforcement]

(environment) at (0 \* 6, 0 \* -2) $ Environment $; (system) at (1 \* 6, 0 \* -2) $ System $;

(environment) – (system) node [midway,above,draw=none] input;

[img:learning:unsupervised]

Further, learning algorithms could be divided into *online learning* and *offline learning* or *batch learning*. The main difference is that an online learning algorithm adjusts the parameter after every single network activation. Offline learning algorithms apply the whole dataset, process the errors or ratings and finally adjust the parameters @haykin2008neural [, 157-158].

Before further explanations, some additional definitions will be given in the following. The trainer holds a dataset $ D = \{\vec{s_r}, \vec{d_r}\}_{r = 1}^{q} $, with the state noted as $ \vec{s}_r $, the network responds with the output $ \vec{a}_r $ and the optimal, desired action is $ \vec{d}_r $. The error characteristics of a network are defined as follows:

$$\begin{aligned}
    e_{j,r} & = d_{j,r} - a_{j,r}                       \nonumber \\
            & = d_{j,r} - y_{z,j,r}                     \label{eq:error:signal}\\
    E_{j,r} & = \frac{1}{2} e_{j,r}^2                   \label{eq:error:neuron_energy}\\
    E_{r}       & = \frac{1}{2} \sum_{j=0}^{l_z}{e_{j,r}^2}     \label{eq:error:energy}\\
    E_{D}   & = \frac{1}{q} \sum_{r=0}^{q}{E_{r}^2}     \label{eq:error:mean}\\
\end{aligned}$$

As defined in equation [eq:error:signal], $ e_{j,r} $ is the *error signal* of a network response in relation to its desired value for each output neuron. $ E{j,r} $ (equation [eq:error:neuron~e~nergy]) is a scalar *error energy* of a single output neuron and $ E_r $ (equation [eq:error:energy]) is the error energy of the whole output vector. The scalar $ E_D $, as defined in equation [eq:error:mean], equals the *total error energy* for a complete dataset. A network configuration can be rated by that mean squared error, its *error rate*.

Every possible configuration of a network architecture, applied to such an error function yields a multi-dimensional error performance surface, or short an *error surface*. Another definition of the term learning is to find the minimum on such an error surface @haykin2008neural [, 157].

### Back-propagation Learning

[sec:art:learning:backprop]

The back-propagation algorithm is an online algorithm and it has two sequential phases. In the *forward phase*, an input signal is processed, layer by layer, as previously described in section [sec:art:nn]. The first step in the *backward phase* is to compute the current error signal $ \vec{e_r} $. This error will be propagated through the network again, but in reversed order. Depending on this error, the synaptic weights will be adjusted. A challenge in this task is the *credit assignment* problem. This is about resolving the correlation between the error signal and one parameter, which is difficult for hidden neurons in particular @haykin2008neural [, 153-155].

The back-propagation is defined in following, which corresponds to equation [eq:neuron:biased~f~ield] with the main difference, that it accumulates the weighted local fields $ y_{i,j,k} $ of the neurons at the outgoing synapses. From this local field follows the weight adjustment $ \Delta w_{i,j,k,r} $, which is proportional to the partial derivative, shown in equation [eq:gradient]. This adjustment can be determined by the *delta-rule*, shown in equation [eq:delta~r~ule]. Important for the weight adjustment is the neuron’s local error signal $ e_{j, r} $ which is not available for hidden neurons. In this case, the gradient $ \delta_{i, j, r} $ depends on the successor neuron gradients $ \delta_{i, j, k, r} $, as shown in equation [eq:hidden~g~radient]. From the gradient’s definition follows that the activation function $ \varphi_{i, j} $ has to be differentiable @haykin2008neural [, 160-161,167].

$$\begin{aligned}
    v_{i, j, r}             & = \sum_{k=1}^{m_{i, j}}{y_{i, j, k, r} w_{i, j, k, r}} \; ; \; y_{i, j, 0, r} = 1     \nonumber\\
    y_{i, j, r}         & = \varphi(v_{i, j, r})                                                \nonumber\\
    y_{z, j, r}         & = e_{j, r}                                                        \label{eq:reversed:neuron:signal}\\
    \delta_{z, j, r}        & = \frac{\partial E_r}{\partial v_{z, j, r}}                                   \nonumber\\
                    & = e_{j, r} \; \varphi'_{z, j}(v_{z, j, r})                                    \label{eq:gradient}\\
    \delta_{i, j, r}        & = \varphi'_{i, j}(v_{i, j, r}) \sum_{k=1}^{m_{i, j}} \delta_{i, j, k, r} \; w_{i, j, k, r}    \label{eq:hidden_gradient}\\
    \Delta w_{i, j, k, r}   & = \mu \; \delta_{i, j, r} \; y_{i, j, r}                                      \label{eq:delta_rule}\end{aligned}$$

The *learning rate* $ \mu $ is a constant value, which is multiplied to the weight change. It decreases the danger of oscillatory changes in the learning task, but increases the runtime of the algorithm. Another drawback of a too small learning rate parameter is a higher probability to stop at a local minimum of the error surface. More on the runtime can be found in section [sec:learning:convergence] @haykin2008neural [, 167].

The parameter *learning rate decay* $ \Delta \mu $ is defined to have a high learning rate at the beginning of a learning process and a descending rate while learning. This works by updating the learning rate with $ \mu_{r+1} = \mu_r \; \Delta \mu $ after each weight adjustment.

An extension to the delta-rule ([eq:delta~r~ule:momentum]), which reduces the risk of getting stuck in a local minimum is the *momentum*. The momentum parameter $ \alpha $ is a constant factor which decreases the previous weight change. This previous change will be applied additionally to add an inertia effect to the learning @haykin2008neural [, 167].

$$\begin{aligned}
    \Delta w_{i, j, k, r}   & = \mu \; \delta_{i, j, r} \; y_{i, j, r} + \alpha \Delta w_{i, j, r - 1}                  \label{eq:delta_rule:momentum}\\
    \Delta w_{i, j, k, r}   & = \mu \; \delta_{i, j, r} \; y_{i, j, r} + \alpha \Delta w_{i, j, r - 1} - \omega w_{i, j, k, r-1}    \label{eq:delta_rule:weight_decay}\end{aligned}$$

The learning parameter *weight-decay* $ \omega $, as used in [eq:delta~r~ule:weight~d~ecay], acts as a constant decreasing factor to the weights. It reduces the squared sum of the weights and with it, in some cases, also the sum of the squared errors @McClelland [, 5.1].

### Stopping and Convergence Criteria

[sec:learning:convergence]

Since the minimum on the error surface is not necessarily reached, if every sample of the dataset is processed by the back-propagation algorithm, it is reasonable to iterate this process. Such an iteration is called an *epoch*, noted as $ p $. But while training multiple epochs, the question is, how many epochs are useful. The easiest method is to define a maximum amount of epochs to train. Another approach is to train as long as certain conditions are fulfilled.

Advantageous conditions are for example a threshold on the change of error rate as defined in equation [eq:convergence:threshold]. Another is the value of the current gradients $ \delta $, as defined in equation [eq:convergence:gradient~t~hreshold]. If the gradients are almost equal to zero, the optimal system response is almost reached @haykin2008neural [, 169].

A different approach is shown in equation [eq:convergence:early~s~topping]. The total error rate after an epoch $ E_{D, p} $ will be compared to previous epochs in blocks of the size $ \eta $. If the error rates are ascending, the minimum is found and the synaptic weights should be set to the values which were reached at after that epoch. The value of $ \eta $ influence the probability to terminate in an local minimum or to reach the global minimum. In common optimization tasks the error will not ascend, but in the case which is described later in section [sec:art:learning:overfitting] it will. This method is called *early-stopping*

$$\begin{aligned}
    threshold               & = \begin{cases}
        0   & |E_{D,p - 1} - E_{D,p}| < \theta \\
        1   & else
    \end{cases}\label{eq:convergence:threshold} \\
    gradient\_threshold         & = \begin{cases}
        0   & \sum\delta_{i, j, k, p} < \theta \\
        1   & else
    \end{cases}\label{eq:convergence:gradient_threshold} \\
    early\_stopping     & = \begin{cases}
        0   & min\{ E_{D, p - \eta}, \dots, E_{D, p}\} > max\{ E_{D, p - 2 \eta}, \dots, E_{D, p - \eta - 1}\} \\
        1   & else
    \end{cases}\label{eq:convergence:early_stopping}
\end{aligned}$$

### Optimization Methods

Since learning is a numerical optimization problem, $ E_{D,r}(w) $ is defined as the error rate for a value of the weights $ w $. This is the cost function of this minimization problem.

$$\begin{aligned}
    g_{D, r}        & = \frac{\partial E_{D, r}(w)}{\partial w}     \label{eq:opt:local_gradient}\\
    \Delta w_r      & = -\mu g_{D, r}                       \label{eq:opt:weight_change}\end{aligned}$$

The back-propagation algorithm in the description in section [sec:art:learning:backprop], uses the *steepest-decent* (also known as *gradient decent*) method which is based on a linear approximation of the cost function. The weight change (equation [eq:opt:weight~c~hange]) requires the local gradient (equation [eq:opt:local~g~radient]) which contains local first order information about the error surface. This method is simple, but it has a slow rate of convergence @haykin2008neural [, 216-217].

Common alternatives are the *conjugate gradient decent* method, the *quasi newton method* and the *stochastic gradient decent* method.

The method of conjugated gradients, which is described in detail in @haykin2008neural [, 218-224], is a second order optimization method. It uses linearly independent vectors, so called A-conjugate vectors, as search directions. In each iteration, the gradient modification and the step size will be calculated. In comparison to the gradient decent method, it converges quicker and requires less total runtime.

The quasi newton method, which is explained in @haykin2008neural [, 224-226], is also a second order optimization method. It approximates the iterative gradient modification which results in a faster convergence, but a larger memory consumption.

The stochastic gradient decent is a second order online-algorithm. It determines the learning rate $ \mu $ for each iteration and improves the total runtime in some cases, but each iteration is relatively expensive @haykin2008neural [, 229-230].

### Overfitting and Generalization

[sec:art:learning:overfitting]

If a system is used to learn a model from a dataset, it is a problem to control its precision. More concrete, the allowed difference between samples and system response. On a noisy signal, a high difference is welcome, but it is not, if it leads to a very unlikely behavior. Another problem is, that a precisely learned system with a low error rate does not necessarily mean that the error is minimal on samples, which are not learned. This phenomenon is known as *overfitting*. The opposite of overfitting is *generalization*, which means a well trained system, shows a good response to unknown samples, too. The system with a good generalization accords to the simplest function which fits the samples. The example in figure [img:art:overfitting] displays the problem for a scalar function, but in higher dimensional functions this problem exists just as well. In terms of generalization, an ideal function looks smooth @haykin2008neural [, 194-196].

A method to avoid overfitting is *cross-validation*. Cross-validation is about partitioning the dataset $ D $ randomly into an training-set $ T $ and a validation-set $ V $. The training-set is used for the training and the validation-set is used for the stop-criteria. The advantage of this partitioning is illustrated in figure [img:art:overfitting].

The training error $ E_{T, p} $ and the validation error $ E_{V, p} $ are defined as $ E_{D, p} $. Compared to each other, they should show the following behavior. The training error converges to zero with increasing epochs $ p $ and the validation error behaves similarly to the training error, but when the system begins to overfit, the validation error starts to increase again. According to the early-stopping method (section [sec:learning:convergence]), the training should be terminated at the minimal validation error instead of the minimal training error @haykin2008neural [, 203-204].

[ group style= group size=2 by 2, xlabels at=edge bottom, ylabels at=edge left , ymin=-1.2, ymax=1.2, legend pos=south west, width=7cm] table[x=x, y=model] data/overfitting.dat; table[x=x, y=samples] data/overfitting.dat;

table[x=x, y=system] data/overfitting.dat; table[x=x, y=samples] data/overfitting.dat;

table[x=x, y=model] data/overfitting.dat; table[x=x, y=validation] data/overfitting.dat;

table[x=x, y=system] data/overfitting.dat; table[x=x, y=validation] data/overfitting.dat;

[img:art:overfitting]

Driver Behavior Test Framework
==============================

[chap:methods]

One objective of this project is to investigate, which network architecture and which learning method are adequate to best represent driving behavior. Furthermore it has to be investigated, which set of features must be selected and which preprocessing operations are required to enhance those features. This requires a simulation environment, which is described in section [sec:methods:simulator], then the scenario and traffic network is topic of section [sec:methods:scenario]. Further the tested state features are explained in section [sec:method:features], before the selection of these features per test and the chosen ranges of the learning parameters are described in section [sec:method:configurations]. The last section [chap:eval] of this chapter explains the evaluation methods in detail.

Simulation Environment
----------------------

[sec:methods:simulator]

The simulation environment, enables to simulate a *traffic network* with autonomous drivers, so called *agents*. A method to get a dataset of a human driver, which is used for training and validation tasks, and a machine-learning component, which allows to train and activate neural networks, are described in section [sec:methods:simulator:blame].

The development of this simulator is an objective of the AVeSi-project and its realization is based on the Unity3D game engine. This engine enables to deploy 3D models of objects like vehicles or landscapes into an virtual mechanical system and computes its interactions. It supports the input by devices like mouses, keyboards and steering wheels. Further it renders pictures of camera objects and so, it is suitable to be the platform for a virtual environment.

Individual object behavior can be archived with programmable behavior scripts. Depending on what is needed, the scripts are executed once a simulation step or once a re-rendering, which frequency depends on the available computing power and the cost of the current rendering. The update rate of simulation steps is $ 50Hz $. Each behavior script holds its own data-structures, which can be modified by other scripts in certain cases.

The traffic network is implemented as data structure of a semantic model, which contains several objects for different purposes. The geometry of the network is stored in *waypoints*. Each waypoint contains a position and an orientation in the coordinate system, and belongs to an *segment*. It holds a special flag, weather it belongs to an unregulated crossroads, a roundabout or it if the lane ends with this waypoint. So, a segment is an ordered list of waypoints, were the order accords to the desired direction of that segment. It contains information like the lanes width or the speed limit. The orientation of a waypoint equals the direction to the successive waypoint. There are two types of segments: the *lane* and the *connector*. Lanes have the condition, that they must not cross other segments. Connectors are free to cross each other, but each connector has one incoming lane and one outgoing lane. Neither more nor less. Figure [img:semantic~t~raffic~n~etwork] shows a cutout of a traffic network, which is modeled this way @HSHMB13 [, 2-4].

() at (1, 1) ; () at (2, 1) ; (0, 1) – (1, 1) – (2, 1);

() at (1, 2) ; () at (2, 2) ; (0, 2) – (1, 2) – (2, 2);

() at (9, 1) ; () at (10, 1) ; (9, 1) – (10, 1) – (11, 1);

() at (9, 2) ; () at (10, 2) ; (9, 2) – (10, 2) – (11, 2);

() at (5, 6) ; () at (5, 7) ; (5, 6) – (5, 7) – (5, 8);

() at (6, 6) ; () at (6, 7) ; (6, 6) – (6, 7) – (6, 8);

() at (4.3, 1.6) ; () at (5.6, 4) ; (2, 1) – (4.3, 1.6) – (5.6, 4) – (6, 6);

() at (3.6, 2.6) ; () at (4.7, 4.3) ; (2, 2) – (3.6, 2.6) – (4.7, 4.3) – (5, 6);

() at (4, 1) ; () at (5.5, 1) ; () at (7, 1) ; (2, 1) – (9, 1);

() at (4, 2) ; () at (5.5, 2) ; () at (7, 2) ; (2, 2) – (9, 2);

() at (5.2, 4) ; () at (6.6, 1.6) ; (5, 6) – (5.2, 4) – (6.6, 1.6) – (9, 1);

() at (6.3, 4.3) ; () at (7.3, 2.6) ; (6, 6) – (6.3, 4.3) – (7.3, 2.6) – (9, 2);

[img:semantic~t~raffic~n~etwork]

A vehicle is implemented as 3d-car-model with an associated agent behavior script. Such an agent behavior script contains a vehicle script which implements the physical behavior with aspects like the gearing mechanism, the engine speed, the steering and velocity. It contains a memory module, which holds information about the traffic network model, objects in the field of view and something more. Last, the agent behavior scripts contain a decision module, which computes a current desired steering angle and a throttle control state based on the memory. By concepts of the object oriented programming like inheritance and polymorphism it is possible to implement different kinds of agents with different behaviors.

Existing implementations use the intelligent diver model with a random navigation through the traffic network with different strategy scripts which solve certain dead-lock situations and priorities. This agents are used to present a filled environment for evaluation and data acquisition tasks @Seele2012a [, 3-4].

### Behavior Learning Machine Extension

[sec:methods:simulator:blame]

The simulation system is extended in several points. A player agent script has a special decision module, which captures the desired steering angle and the torque state from a physical steering wheel with a throttle control. A special memory module enables to observe a wide range of state features, which are described in section [sec:method:features]. This observation memory module is used for the dataset gathering and the network instance evaluation, too. Since the fixed update rate of the behavior scripts, the maximal sample-rate of a dataset is $ 50Hz $. Another agent implementation uses the response of a neural network as the behavior of its decision module. The datasets and network instances are stored in an separate software component, which is connected to the simulation environment by a restful web-service. The network creation, training and activation can be done without the overhead of a running game engine via web-interface or custom batch scripts.

The dataset gathering of human drivers uses this extension. As input devices a steering wheel with force feedback, a throttle and a brake pedal are used. The duration of the driving session is not limited. The perspective of a human driver is shown in image [img:scene].

Scenario and Traffic Network
----------------------------

[sec:methods:scenario]

![image](images/scene)

[img:scene]

The scenario, in which the datasets are captured and the network instances are evaluated, contains a sample traffic network, as shown in figure [img:scene]. It consists basically of a traffic circle, whose four gateways are connected by two large loops. So the test scenario will be designed as a closed road system, that no agents leave or enter the system.

This traffic network was chosen for the reason, that the roundabout gives margin to the agents to act character dependent. For example to violate the right of way or to rush into narrow spaces. The loops with some straight parts produce situations, suitable for overtaking maneuvers and congestion by slow vehicles. Anyway, its complexity is intense bounded.

The number and type of agents, which will be deployed into the simulation, is variable. In dataset sampling sessions, four scripted agents without a machine-learning-based behavior are selected. They act compliant to speed limits and the right of way at the roundabout. Depending on the evaluation methods, which are explained in section [chap:eval], the configuration varies.

Subjected Features
------------------

[sec:method:features]

Regarding to the introduction in the method of neural networks in chapter [cap:state~o~f~a~rt], certain components of the state and the action vector have to be chosen and implemented for different tests. Abstract state components could be the distances and directions to the objects in sight, the velocity and orientation of vehicles, attributes like the maximum engine performance of the own vehicle or for example the current weather condition. Possible action features are for example the setting of the steering wheel or hand signals to other drivers. This and much more information are used by the human brain to decide, but some of these are more and some are less important.

The decision, which features are used in this tests, depended on the availability of information and assumptions of relevance for the task.

For a general overview, the subjected feature space is divided into four categories: *vehicle features*, *traffic network features*, *obstacle features* and *action features*. According to this taxonomy, the available features are described in the following.

The vehicle features are those features, which belong to the controlled car. Those are listed in table [tab:vehicle~f~eatures]. Further the traffic network features contain information about the traffic network in relation to the controlled vehicle. That means, the distances are measured in a vehicle local coordinate system, which is translated by the vehicle’s position and rotated by the vehicle’s orientation. Available traffic network features are the shown in table [tab:traffic~n~etwork~f~eatures] and some are additionally illustrated in image [img:traffic~n~etwork~f~eatures]. Which waypoints are considered, depends on the test itself, but candidates are a few next and previous waypoints relative to the vehicle’s position in the current segment. Obstacles are objects like other vehicles. The features are similar to features according to waypoints with additional features like the velocity. Further, the obstacles are ordered by their distance and parted by the directions: left, front and right. Available obstacle features are listed in table [tab:obstacle~f~eatures]. The action features are rather simple, they represent the state of a actuator. Available action components are the steering angle and the throttle state, sequentially from the simulation implementation (see section [sec:methods:simulator]).

[P]

p.6|l|l **Description** & **Type** & **Label**\
Vehicle position & vector ($x, y, z$) & *V.Pos*\
Vehicle rotation & vector ($x, y, z$) & *V.Rot*\
Vehicle velocity & scalar & *V.Vel*

[tab:vehicle~f~eatures]

[P]

p.6|l|l **Description** & **Type** & **Label**\
Relative waypoint position & vector ($x, y, z$) & *D.Pos*\
Relative waypoint rotation & vector ($x, y, z$) & *D.Rot*\
Relative waypoint direction & scalar ($degree$) & *D.Dir*\
Distance to waypoint & scalar & *D.Dis*\
The relative distance to the last waypoint of the current segment & scalar & *L.TillEnd*\
The maximal offset in the x dimension in the relative position of the next and previous waypoint & scalar & *L.LaneDrift*

[tab:traffic~n~etwork~f~eatures]

[P]

p.6|l|l **Description** & **Type** & **Label**\
Relative obstacle position & vector ($x, y, z$) & *O.Pos*\
Relative obstacle rotation & vector ($x, y, z$) & *O.Rot*\
Obstacle distance & scalar & *D.Dis*\
Obstacle velocity & scalar & *O.Vel*

[tab:obstacle~f~eatures]

at (-4, -1) ;

​(a) at (0, 0) ; (d0) at (-2.5, 1.5) ; (d1) at (-3, 3) ; (p) at (3, 2) ;

​(a) – (-.94, .34) node [midway,above,draw=none] ; (a) – (0.34, 0.94) node [midway,above,draw=none] ;

(4, -1) – (4, 7);

at (-1, -3.14) ;

​(a) at (0, 0) ; (d0) at (.55, 2.86) ; (d1) at (1.79, 3.85) ; (p) at (2.91, -2.14) ;

​(a) – (0, 1) node [midway,above,draw=none] ; (a) – (1, 0) node [midway,above,draw=none] ;

(0, -.5) – (.55, -.5) node [pos=1,below,draw=none] $D.0.Pos.X$; (-.5, 0) – (-.5, 2.86) node [midway,above,draw=none,rotate=90] $D.0.Pos.Y$;

(0, 0) – (14, 0);

at (-3, -3) ;

​(a) at (0, 0) ; (d0) at (.55, 2.86) ; (d1) at (1.79, 3.85) ; (p) at (2.91, -2.14) ;

​(a) – (d0) node [pos=0.3,right,draw=none] $D.0.Dis$; (a) – (0, 2.91) node [midway,right,draw=none] ; (0, 2) arc (90:90-11:2) node [left] $D.0.Dir \quad$;

(3.91, -4.1) – (3.91, 4.85);

at (-2, -3.14) ;

​(a) at (0, 0) ; (d0) at (.55, 2.86) ; (d1) at (1.79, 3.85) ; (p) at (2.91, -2.14) ;

​(a) – (0, 1) node [midway,above,draw=none] ; (a) – (1, 0) node [midway,above,draw=none] ;

(0, -.5) – (.55, -.5) node [midway,below,draw=none] ; (d0) – (.55, -.5) node [midway,below,draw=none] ; (0, -.9) – (2.91, -.9) node [midway,below,draw=none] ; (p) – (2.91, -.9) node [midway,below,draw=none] ; (0, -.7) – (2.91, -.7) node [pos=0.6,above,draw=none] $L.LaneDrift$;

[img:traffic~n~etwork~f~eatures]

Considered Configurations
-------------------------

[sec:method:configurations]

The tested learning machines are in general feed forward neural networks in various sizes, trained with the backpropagation algorithm, which uses the gradient decent algorithm. The configuration of such a network instance consists of a dataset with its feature space, a network architecture and the values of the learning algorithm’s parameters.

As it is an objective to investigate which features are necessary for machine learning based agents to act realistic, certain subsets of the available state features are defined. And as the number of features influences the number of neurons, at least of the input layer, the acceptability of that instance is threatened according to the available computing resources. Four subsets are defined for the tests: *simple steering set*, *simple steering and acceleration set*, *advanced steering and acceleration set* and *advanced traffic set*. Of which features the sets are consisting, is defined in table [tab:feature~s~election]. All concrete datasets are derived from a basic dataset, which contains all available features.

Regarding to the description of the model of a short term memory in [sec:art:ffnn], the order of that time delayed input is also an configuration parameter, which has to be chosen. It influences the network size and probably the behavior performance, too. Every dataset is tested without time delayed input and additionally with short tern memory units order two and five, which means a three or six times bigger input vector.

The basic sample rate of $ 50Hz $ defines the maximal possible sample rate and one approach is to test datasets, which contain only every $ k^{th} $ sample of the underlying dataset. The hypothesis is, that a minor sample rate may increase the the difference between training and validation dataset, which improves the learning performance regarding to the overfitting problem (see section [sec:art:learning:overfitting]). In concrete, the previously derived datasets are tested with sample rates of $ 50Hz $, $1Hz$ and $0.1Hz$. From this follows a set of derived datasets shown in equation [eq:dataset~t~est~s~pace]

The tested network architectures have an input layer, which uses an min- max- normalization, an linear output layer and at least one hidden layer with a sigmoid activation function. The min- max- normalization is used, because the domain is well known and can be evaluated from the samples, so the linear behavior can be obtained. As activation function for hidden layers, the sigmoid function is used. Further, the network label note the network structure depending on the feature set of the associated dataset. Each ’s’ in the label stands for one hidden layer and the previous number is a factor, were the hidden layer’s size is the product. The sum of the length of the input and output layer is the other factor. The tested architectures are shown in equation [eq:arch~t~est~s~pace]. There are networks with up to three hidden layers with up to $1620$ neurons per layer, which should enable to model high level characteristics. So the network size range is from $5$ to $2756$ neurons.

The tested learning parameter space is shown in equation [eq:learning~t~est~s~pace]. Parameters like weight decay, learning rate decay were left out, to limit the instances which have to be trained. The chosen ranges for learning rate, momentum and max epochs depend on experienced data.

Each configuration is tested five times to reduce the impact of the random initialized synaptic weights and random partitioned datasets. This leads to a total amount of $2880$ configurations and $14400$ instances which have to be learned.

[P]

l|p4cm|p1.9cm|p1.9cm|p1.9cm|p1.9cm\
 &\
 &&\
 &&&\
 & & & &\
 &$ V.Vel $ & & & &\
& & & & &\
& & & & &\
& & & & &\
 &$ D.0.Rel.X $ & & & &\
&$ D.0.Rot.Y $ & & & &\
&$ D.0.Dir $ & & & &\
&$ D.0.Dis $ & & & &\
&$ D.1.Rot.Y $ & & & &\
&$ D.1.Dir $ & & & &\
&$ D.1.Dis $ & & & &\
&$ D.2.Rot.Y $ & & & &\
&$ D.2.Dir $ & & & &\
&$ D.2.Dis $ & & & &\
&$ L.TillEnd $ & & & &\
&$ L.LaneDrift $ & & & &\
&$ L.AllowedSpeedError $ & & & &\
 &$ OF.0.Rot.Y $ & & & &\
&$ OF.0.Vel $ & & & &\
&$ OF.0.Dir $ & & & &\
&$ OF.0.Dis $ & & & &\
&$ OR.0.Rot.Y $ & & & &\
&$ OR.0.Vel $ & & & &\
&$ OR.0.Dir $ & & & &\
&$ OR.0.Dis $ & & & &\
&$ OL.0.Rot.Y $ & & & &\
&$ OL.0.Vel $ & & & &\
&$ OL.0.Dir $ & & & &\
&$ OL.0.Dis $ & & & &\

[tab:feature~s~election]

$$\newcommand{\verteq}{\begin{turn}{90}$=$\end{turn}}
\begin{matrix}
    \begin{Bmatrix}
        simple \; steering \; set \\
        simple \; steering \; and \; acceleration \; set \\
        advanced \; steering \; and \; acceleration \; set \\
        advanced \; traffic \; set
    \end{Bmatrix} 
            &\times&
    \begin{Bmatrix}
        0 \\
        2 \\
        5
    \end{Bmatrix} 
            &\times&
    \begin{Bmatrix}
        50Hz \\
        1Hz \\
        0.1Hz
    \end{Bmatrix} \\
    \verteq & & \verteq         & & \verteq \\
    subsets & & delay \; order  & &     sample \; rates
\end{matrix}
\label{eq:dataset_test_space}$$

$$architectures = \{
    FFN1s,
    FFN2s,
    FFN5s2s,
    FFN10s5s,
    FFN10s5s2s
    \}
\label{eq:arch_test_space}$$

$$\newcommand{\verteq}{\begin{turn}{90}$=$\end{turn}}
\begin{matrix}
    \begin{Bmatrix}
        0.01 \\
        0.001
    \end{Bmatrix} 
            &\times&
    \begin{Bmatrix}
        0.5 \\
        0.9
    \end{Bmatrix} 
            &\times&
    \begin{Bmatrix}
        1 \\
        3 \\
        5 \\
        10
    \end{Bmatrix} \\
    \verteq     & & \verteq     & & \verteq \\
    learning \; rates   & & momentum    & &     max \; epochs
\end{matrix}
\label{eq:learning_test_space}$$

Evaluation
==========

[chap:eval]

The evaluation is divided into three categories. The learning evaluation, the acceptability tests and the runtime measurements.

The purpose of the learning evaluation is to get an overview of the tested configurations and to get an first conclusion, which parameters are important and which values are suitable. The chosen evaluation method is described in section [sec:eval:learn]. Based on this results, the configurations are evaluated regarding acceptability aspects, which is described in section [sec:eval:acc]. Since virtual environments require real-time execution, expensive computations per agent constrain the solution’s acceptability, too. So the difference in runtime issues of the tested solutions are explored. The used method is explained in section [sec:eval:runtime].

The following tests are based on a dataset, containing $ 137887 $ samples, what means a driving session of 45 minutes.

Training Evaluation
-------------------

[sec:eval:learn]

In the learning task, the method of cross-validation is used. The dataset is divided in a $ 3:1 $ ratio of training data to validation data. Each network instance has a unique random partitioning.

The training stops after the defined max-epoch or the epoch determined by the method of early stopping. The resulting validation error $ E_{V} $ is used as characteristic for training performance and for comparison of different approaches. The validation error rate is the *offline score* of an network instance. The comparison is based on the error rate distribution. More concrete, the set of all trained network instances is parted by certain parameters and attributes and the distribution quantities like minims, maxims and median are compared.

As dataset parameters, the feature count, the sample rate and the order of the short term memory are compared. As learning parameters, the learning rate, the maximal number of epochs and the momentum are used. And as network parameters, the set is divided by the number of hidden layers, the total number of neurons and the network structure.

As is it desired, that different feature subsets require not necessary the same network and learning configurations to show good performance, the networks of the same feature subset are tested for them own.

### Importance of the Network Structure to the Validation Error Rate

A first hypothesis is that the less neurons have to be trained, the better the results become. Better means a lower minimal validation error and a tighter distribution. A tighter distribution is a better result, because less network instances have to be learned to obtain one, which is near optimal in its potential.

[ht]

[group style=columns=1, rows=4, horizontal sep=.05,vertical sep= 2.5cm, ylabels at=edge left, enlarge x limits=0.5, box plot width=2mm, width=.465, height=8cm, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style=text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=yshift=-1cm, ylabel=validation error, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.03, ymax=1] table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv;

[img:le:nc:1]

[ht]

[group style=columns=1, rows=4, horizontal sep=.05,vertical sep= 2.5cm, ylabels at=edge left, enlarge x limits=0.5, box plot width=2mm, width=.465, height=8cm, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style=text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=yshift=-1cm, ylabel=validation error, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.03, ymax=1] table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~n~euron~c~ount/thaubr~a~dvanced~t~raffic.csv;

[img:le:nc:2]

Evidence for this relation were found as illustrated in images [img:le:nc:1], [img:le:nc:2], but the relation is not as simple as the hypothesis is. First, instead of a linear relation from the total count of neurons to the validation error, the distribution parameters and in special the lower quartile, the median and the upper quartile have sawtooth shape. This means there is relation but a more important parameter warps it.

This parameter exists because the total number of neurons is not independent. It depends on the dataset feature count and obviously on the network structure, more precisely on the number of layers and the neuron count per layer.

[ht]

[group style=columns=2, rows=2, horizontal sep=.05,vertical sep= 2.5cm, ylabels at=edge left, enlarge x limits=0.5, box plot width=2mm, width=.465, height=8cm, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style=text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=inner ysep=.2cm, ylabel=validation error, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.03, ymax=1] table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~f~eature~c~ount/thaubr~a~dvanced~t~raffic.csv;

[img:ve:fc]

The feature count of the related dataset is nearly linear to the validation error, as shown in image [img:ve:fc]

[ht]

[group style= columns=2, rows=2, horizontal sep=.05, vertical sep= 2.5cm, ylabels at=edge left , box plot width=2mm, width=.465, height=8cm, xticklabel style=rotate=45, enlarge x limits=0.1, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style= text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=yshift=-1.7cm, ylabel=validation error, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.03, ymax=1] table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~n~etwork/thaubr~a~dvanced~t~raffic.csv;

[img:ve:arch]

The other factor is the network structure. As shown in image [img:ve:arch], the best results are reached by a network with three hidden layers. And the comparison of *FFN5s2s* to *FFN2s* accords to the assumption, that more hidden layers can represent the behavior better.

Another result is the impact of the size of the last hidden layer. *FFN1s* compared to *FFN2s* and *FFN5s2s* to *FFN10s5s* shows that the smaller last hidden layer indicates the better result. Based on these results and the comparison of *FFN5s2s* to *FFN1s* and *FFN2s*, the size of the last hidden layer is more important than the amount of hidden layers.

### Influence of Learning Parameters to the Validation Error Rate

[ht]

[group style=columns=2, rows=2, horizontal sep=.2,vertical sep= 2.5cm, ylabels at=edge left, enlarge x limits=0.5, box plot width=2mm, width=.365, height=8cm, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style=text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=inner ysep=.2cm, ylabel=validation error, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.03, ymax=1] table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~l~earning~r~ate/thaubr~a~dvanced~t~raffic.csv;

[img:ve:lr]

The second question is about the impact of the learning parameter to the validation error. At first, the evaluation of the learning rate options of $ 0.01 $ and $ 0.001$ is rather unclear. As shown in image [img:ve:lr] , for subset *S1*, *S2* and *S4* the upper quartile of the higher learning rate is lower, but the median is higher. On *S3* the upper quartile of the networks with a learning rate of $ 0.01 $ is also higher. A relation between the learning rate and the validation error was not discovered. May be the tested range was to small to get significant results.

A relation between validation error and the momentum parameter could not be discovered, too. It trends to result in better validation errors with a momentum value of $ 0.5 $, but the error rate on networks with datasets on *S2* are lower with a momentum of $ 0.9 $.

[ht]

[group style=columns=2, rows=2, horizontal sep=.05,vertical sep= 2.5cm, ylabels at=edge left, enlarge x limits=0.5, box plot width=2mm, width=.465, height=8cm, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style=text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=inner ysep=.2cm, ylabel=validation error, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.03, ymax=1] table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~m~ax~e~poch/thaubr~a~dvanced~t~raffic.csv;

[img:ve:me]

The validation error rate decreases with a increasing number of at most trained epochs, but this influence is limited to an individual value. At this lower bound, the distribution spread is also at its minimum. This limit depends probably on the potential of the network structure, the dataset and other parameters. Another result is shown in image [img:ve:me]. The speed of reaching this lower bound depends on the count of dataset features. That means, that the number of epochs to train has to chosen based on the network size.

The approach of reducing the sample rate of the basic dataset to improve the effect of cross-validation can not be evaluated by the the training or validation error. This will be part of the acceptability evaluation in section [sec:eval:acc], but because every test is based on one derived dataset, the datasets with a reduced sample rate contain less samples. But as displayed in [img:ve:sc], the number of samples in the training set have a significant impact to the validation error. The more samples are available, the better the validation error distribution becomes. This relation is logarithmic decreasing, whose speed and limit depends on the network size, as visible on the comparison of the results of *S1* to *S4*.

[ht]

[group style=columns=2, rows=2, horizontal sep=.05,vertical sep= 3cm, ylabels at=edge left, xticklabel style=rotate=45, enlarge x limits=0.5, box plot width=2mm, width=.465, height=8cm, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style=text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=inner ysep=.8cm, ylabel=validation error, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.03, ymax=1] table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~s~imple~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~s~teering~a~nd~a~cceleration.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~t~raffic.csv; table data/validation~e~rror/by~s~ample~c~ount/thaubr~a~dvanced~t~raffic.csv;

[img:ve:sc]

Acceptability Evaluation
------------------------

[sec:eval:acc]

An additional evaluation method aims to test a solution relating to the applicability for virtual environments. The procedure is about deploying certain agents into the simulation and logging rule violations like collisions, deadlocks or faulty navigation. More concrete, some performance features are logged additional to the implemented state features (see section [sec:method:features]) Based on this features, certain values are computed per network instance, which are called *online scores* in the further.

The *steering score* is like the mean time on the road. It is based on a boolean performance feature, which is true if the $L.LaneDrift$ is greater than the lane’s half width. From the arithmetic mean over a whole dataset follows the relative time share, were the vehicle was on and off road.

The *collision score* indicates the number of collision accidents per time. It is based on a boolean feature, which is true, if the vehicle is involved in a collision. One accident is counted only one time, because both vehicles respawn on such an collision. The mean value of this collision trigger has the meaning of *accidents per time*.

The *speed error* is the absolute of the difference between the vehicle’s ($ v $) and the allowed velocity ($ v_a $).

To take account of the case, that a lower than the allowed speed ($v_a$) is plausible, for example in a high volume of traffic, an additional feature is used (see equation [eq:methods:desired~s~peed~p~enalty]). From this follows the *speed penalty*, were the more vehicles are in sight ($o$), the less penalty is given. On the other hand, the far the vehicle is slower than allowed, the more penalty is given.

$$\label{eq:methods:desired_speed_penalty}
\frac{v_a}{1 + | v | } \; \frac{1}{1 + o}$$

Based on the previous tests, instances for the acceptability tests have to be selected, caused by the limits of available computing resources. To prevent from losing the bandwidth of learned behavior, the five best and five worst instances of each configuration are chosen. The instances with different learning parameter options are united to groups of the same network and dataset parameters, because of the minor importance of the learning parameters to the validation error.

The chosen network instances were deployed to the system with ten rule based agents to interact with. Each test session took 5,6 minutes, which depends on the available time and the total number of chosen networks.

### Dependency between Online and Offline Scores

[ht]

[ group style= group size=2 by 2, horizontal sep=2cm, vertical sep=.5cm, xticklabels at=edge bottom, height=.465,width=.465, ]

table[x=validation~e~rror,y=score]data/steering~e~rror~b~y~v~alidation~e~rror.csv; table[x=validation~e~rror,y=score]data/collisions~b~y~v~alidation~e~rror.csv; table[x=validation~e~rror,y=score]data/speed~e~rror~b~y~v~alidation~e~rror.csv; table[x=validation~e~rror,y=score]data/speed~p~enalty~b~y~v~alidation~e~rror.csv;

[img:ve:score]

The next question is, if a dependency between the offline score and the online scores could be observed. As image [img:ve:score] shows, the first characteristic of the steering score results is, that the most samples either have a value of $0$ or of $1$. One reason for this could be the difficulty to return to the street after loosing the right waypoint. Another result is that the less the validation error is, the less the number of collisions is. This striped shape is a result of a discrete number of collisions in that period. The speed penalty result has two clusters. One between zero and one, which means the vehicle were not slower than the allowed speed or at least one car were in the field of view, which possibly blocked the lane. The speed error distribution has three clusters. The most significant is add a speed error of $8.5 m/s$, which corresponds obviously to the speed limit of $8.5m/s$ on the large loops. So the cars with a mean speed error of this value, have not started driving. Another cluster with a speed error of circa $36  m/s$ contains instances, which learned to accelerate but not to control the speed, which did probably the instances of the third cluster between $1 m/s$ and $5 m/s$. The reason, why no agent reached a mean speed error of zero is, that the human did not know that limit so it was not stored in the dataset. Based on the previous results, the question of the dependency between offline and online scores can be negated.

### Properties of Successful Agents

To get information about the question, which configurations are adequate to learn driving behavior, the networks were filtered by their online scores as follows. The steering score must be higher than $ 0.2 $, the speed penalty must not higher than $8$ to ignore instances that have not moved. The result is, that only $ 37 $ instances passed that requirements. Possible reasons for this, should be illustrated in the following paragraphs.

[ group style=columns=2, rows=1, horizontal sep=1cm, width=.465, height=5cm, ybar, ymin=0, ymax=6 ] table [x=i, y=share, meta=count] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~s~ubset.csv; table [x=i, y=share, meta=count] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~m~emory~o~rder.csv;

[img:a:ds]

As the image [img:a:ds] shows, there is no clear best choice for selecting the state vector. The maximal amount of accepted instances was trained on the feature subset *S1* ($ 19 $ of $450$), which is a bit better than the result of *S4* ($10$) and *S2* ($8$). The result of the importance of the memory order has same weak significance. Even the divisions of accepted network instances divided by the feature subsets contain all available memory order options.

[ group style=columns=3, rows=1, horizontal sep=1cm, width=.265, height=5cm, ybar, ymin=0, ymax=4 ]

table [x=i, y=share, meta=count] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~m~ax~e~poch.csv;

table [x=i, y=share, meta=count] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~l~earning~r~ate.csv;

table [x=i, y=share, meta=count] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~m~omentum.csv;

[img:a:me]

[ width=.5, height=5.5cm, xbar, xmin=0, xmax=4, xlabel=accepted [%], ytick=data, yticklabels from table=data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~n~etwork.csvoption, nodes near coords, point meta=explicit symbolic, every node near coord/.append style=anchor=west, ] table [y=i, x=share, meta=count] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~n~etwork.csv;

[img:a:ns]

Since the majority of the accepted networks are trained only one epoch (see image [img:a:me]) and the feature subset *S1* delivered the best results, the reason for the insufficient results could be the overfitting phenomenon as described in section [sec:art:learning:overfitting]. The share of accepted networks per network structure as illustrated in image [img:a:ns] shows the trend for better results of smaller networks, which confirms the hypothesis.

[ xbar, xmin=0, xmax=6, ytick=data, yticklabels from table=data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~s~ample~c~ount.csvoption, ymin=-.5, ymax=2.5, height=5cm, width=.5, ylabel=sample count, ylabel style=yshift=.7cm, xlabel=accepted [%], nodes near coords, point meta=explicit symbolic, every node near coord/.append style=anchor=west, ]

table [y=i, x=share, meta=count] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~s~ample~c~ount.csv;

[ xbar, xmin=0, xmax=6, hide x axis, axis y line\*=right, ytick = data, yticklabels from table=data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~s~ample~r~ate.csvoption, ymin=-.5, ymax=2.5, height=5cm, width=.5, ylabel=sample rate [Hz], ylabel style=yshift=8.1cm ] table [y=i, x=share] data/filtered~n~etwork~c~ount/filtered~n~etwork~c~ount~b~y~s~ample~r~ate.csv;

[img:a:sr]

As described in [sec:method:configurations] a hypothesis is that a high sample rate lowers the effect of the cross validation method, which could increase the overfitting problem, which subsequently lowers the agents online performance. The measurements, which are displayed in image [img:a:sr], support this. No network was accepted, which was trained with the maximal sample rate of $50Hz$, $10$ with $1Hz$ and $27$ with $0.1Hz$.

Scalability Evaluation
----------------------

[sec:eval:runtime]

The efficiency of the different solutions is evaluated by runtime measurements with various amounts of agents. This allows a statement about the scalability and limits of the tested system. Further it has to be determined at which count of agents the real-time requirement is violated.

For this purpose, the agents are set to positions, which are distributed over the traffic network. While the simulation runs, the renderer refresh rate, which is measured in *frames per second* ($ FPS $), is stored each frame. That data enables to get the minimal and average refresh rate. This was repeated with $1 - 50$ agents for about $60s$. For each network instance the scalability score *max agents* was determined. It corresponds to the minimal number of agents, which not reached a result, lower than the simulations update rate of $50Hz$.

The resource consumption , which influences the refresh rate, is caused in general by the following tasks. The rendering, which depends on the number and type of objects in the camera’s field of view. The physical simulation, which is in this case only the vehicle movement and depends on the number of agents. Another factor is the update of the memory module of each agent, beneath the state vector generation. Further the network activation, which computes the agent’s decision, and the communication between the simulation environment and the machine learning component consumes time.

Depending on the resource consumer, the runtime grows with the number of agents in a linear or higher order. For example, the time used for network activation and communication should grow only linear to the agent count. But more agents lead to more agents in the field of view of each agent, which should bring exponential growth.

To determine the part, caused by the machine learning component, each measurement in the simulation is repeated in the machine learning component without the simulation environment related tasks.

### Scalability Measurements

[ width=, height=5cm, legend pos=north east, xlabel=neurons, ylabel=max agents, ] table[x=option, y=error~r~ate~m~ax] data/max~a~gents/by~n~euron~c~ount/online.csv; table[x=option, y=error~r~ate~m~ax] data/max~a~gents/by~n~euron~c~ount/offline.csv;

[img:ma:nc]

Since larger networks should have the ability to learn more complex behaviour, the number of max agents by the feature count could be a good performance indicator for neural network based agents. As image [img:ma:nc] shows, networks with less than $1000$ neurons are not defining the simulation’s number of agents.

[ht]

[group style=columns=1, rows=1, horizontal sep=.05,vertical sep= 3cm, ylabels at=edge left, xticklabel style=rotate=45, enlarge x limits=0.5, box plot width=2mm, width=.465, height=6cm, scaled y ticks=base 10:0, major x tick style = transparent, yticklabel style=text width=0.035, align=right, inner xsep=0pt, xshift=-0.005, xlabel style=inner ysep=.8cm, ylabel=max agents, ylabel style=text height=0.02, inner ysep=0pt, ymin=0.0, ymax=25] table data/max~a~gents/by~f~eature~s~et/online.csv; table data/max~a~gents/by~f~eature~s~et/online.csv; table data/max~a~gents/by~f~eature~s~et/online.csv; table data/max~a~gents/by~f~eature~s~et/online.csv;

[img:ve:fs]

As shown in image [img:ve:fs], another result is, that the feature set is important for the system performance. Small feature sets enable to simulate up to $17$ agents in realtime. Bigger sets are limited to round about $10$ agents. These values could be shifted by optimizing the software or hardware but the relation should be stable.

Conclusions
===========

[chap:conclusion]

A dataset with more than $130k$ samples of a driving session of $45m$, were trained in four different feature subsets. Three different settings of time delayed input were used and, 14400 network instances were trained. The networks are distinguished in their number of layers and neurons per layer. In their learning rate, momentum and number of epochs to train.

The result of this project is no concrete neural network with specific learning parameters, which have to be learned to represent a the driving behavior of a human in detail. Instead some general insights about behavior learning were investigated. First, the validation error rate raised linearly with feature count and so with the neuron count. More hidden layers could significantly reduce the error rate. Another important factor was the network’s shape. For example the last hidden layer raised the error rate, if it is to big in relation to the output vector.

Another insight is, that learning parameters are not very important on tests of a high amount of different networks. It should be used to tweak a system with a fixed network structure and dataset, instead. An exception is the maximal number of epochs to train.

Further a result is, that the validation error rate has minor importance for the online performance of a learned agent. It should be used for comparison of networks with the same structure and dataset. For example at this results, a higher number of maximal trained epochs improved the validation error rate but corrupted the network acceptance probability.

Another result is the importance of the system’s sample rate. A high sample rate increases the overfitting problem. It might be fixed by using a significant bigger share of the dataset as validation set and a smaller share as training set, but in both solutions, decreasing the sample rate and tuning the training set share, a longer sample session is required.

The scalability tests proved, that neural network with a number of neurons below $1000$ should not violate the realtime requirement for up to $10$ agents. An bigger difference in runtime issues were proved in the method of feature acquisition, but this should depend on the simulator implementation instead of the machine learning method.

Future Work
-----------

As the results of this work show, the overfitting problem is a big challenge for learning behavior in virtual environments. Two factors are important and also critical. The duration of the training and the size of the network. Since the training duration depends on the dataset size, the dataset consistency and the number of epochs, further implementations of machine learning based drivers should gather more training data an evaluate which share is needed for validation.

An inappropriate network size and structure is the other cause for overfitting. In this project, only fully connected feed forward neural networks were tested. Another approach could be the determination of one feature set, for example one, which is used by other driver models. Based on this feature set, a big neural network could be trained, tested online and offline and than reduced by pruning methods. This should provide a minimal network with a better performance.

Apart from the goal to improve the machine learning based agents, the developed software toolkit could be improved to a software product, which is utile for general behavior learning research. Features could the storage of datasets. The training, storage and activation of neural networks. Support for distributed usage and functions for result processing and visualization.

[^1]: <http://www.cv-lab.inf.h-brs.de/avesi/>
