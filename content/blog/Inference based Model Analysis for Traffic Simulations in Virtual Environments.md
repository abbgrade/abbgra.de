tags: [virtual environments, traffic simulation, behavior evaluation]
type: blog-post
category: blog
datetime: 2014-04-24 00:00:00
title: Inference based Model Analysis for Traffic Simulations in Virtual Environments
summary: In this work, human and artificial drivers were compared by their behavior in the same virtual environment. To accomplish this task, driving behavior of human test subjects was recorded from a car simulator. The parameters of artificial drivers were inferred from the recorded data based on evolution strategies. Using cluster analysis the states of deviating steering or acceleration actions were reduced to traffic situations which the driver model is so far unable to manage correctly. As a result, concrete ranges for abstract values of a driver profile can be inferred for which the simulated driving behavior does not change. The precision depends on the amount of data and the scenarios in which it was recorded. Further, situations in traffic could be detected in which certain behavior patterns are observable between different human drivers. Hence, the proposed method is useful to compare human and artificial driving behavior and reduce the representation of the deviation to a manageable size.
---

Introduction {#chap:introduction}
============

The question, answered in this work is, which significant differences between real human behavior and an implemented driver model for traffic simulations exist and how they can be detected. This work is motivated by the following circumstances.

The mathematical approach is very successful in the domain of quantitative sciences. Recently, this approach has also been used to describe human behavior. This seems paradox since individual human actions can obviously not be schematically described by formulas. However, two aspects allow the description of driver behavior in a quantitative way. First, a lot of data can be measured in traffic. The actions of one or many drivers and information about the environment can be observed in reality or in virtual environments. Second, the drivers interactions are limited by the vehicle. These measurements, which are represented by experiments in science, form the basis of every model. By comparing the observations with the model, the model can be refined and their parameters can be adapted @Treiber2010a [1].

Further, this work is part of the AVeSi[^1] project where the objective is to develop a realistic traffic simulation for virtual environments. This should be achieved by assigning a personality profile to each traffic participant, which models individual risk aversion and generates specific behavior patterns. The simulation of such realistic behavior is challenging, because it leads to a complex set of situations for which an appropriate driver reaction has to be generated, which may differ significantly between individual drivers. While developing and evaluating a realistic traffic simulation, a complex issue is to decide whether realistic behavior is simulated. Thus, the motivation was to compare the behavior of human drivers and artificial intelligent drivers in the same virtual environment.

The approach for answering the question of existing behavior differences is divided into two major challenges and several tasks. The first challenge is the alignment of the actions of human and artificial drivers to enable their comparison. The second challenge is the reduction of the representation of the differences to a manageable amount to enable the analysis of the driver model. The alignment is done by simulating the actions from recorded states. This requires the development of a car simulator based on a virtual environment containing a section of a town with roads, sidewalks, buildings and other artificial traffic participants. The virtual environment was developed in the FIVIS[^2] project. Another challenge in the alignment of human and artificial actions is to infer the correct model configuration to get the minimal possible deviation. Abstract information like the personality profile of a human can already be inferred from behavior in limited areas @Chittaranjan11whoswho but so far not by the behavior in traffic. However, the method to accomplish this task has to be chosen and evaluated.

Modeling driver behavior generally requires the prediction of the action for each state of the environment. As defined in @Tarantola2004, measurements can be predicted if the physical system is completely described. Such modeling or simulation problems are also called forward problems. They define a mapping from *model space* to *data space*. Inverse problems use measurements to infer values of parameters that characterize the system. Humans are obviously not fully described systems, thus only the inverse modeling makes sense. Therefore, two general approaches exist. Probabilistic methods assume an a priori probability distribution over the model space and transform an a posteriori probability distribution using measured relations of parameter configurations to observations. Alternatively, generic optimization algorithms could be used as heuristic for the inverse mapping. The general theory has a simple formulation and applies to any kind of inverse problem, including linear as well as strongly nonlinear problems.

Further, for the analysis of the model, the investigated data needs to contain the behavior in a large amount of traffic situations. Hence, human test subjects will be asked to use the simulator and will be brought into certain defined scenarios, which enforce discrete decisions, for example, the acceptance of gaps or priority considerations.

Due to the large amount of data, the analysis of the resulting deviation between reality and model is another challenge. The investigated approach is based on cluster analysis. Therefore, different algorithms have to be evaluated based on the application’s requirements and meaningful features of the data have to be selected for clustering. Further, the behavior deviations have to be classified based on their significance and temporal importance and a representation has to be found, which enables interpretation of the results. Finally, all of these processes have to be verified by specific evaluation methods.

The model analysis itself is about detecting situations which are not considered by the current driver model so far. Therefore, such variables which indicate the misbehavior and allow to determine the correct actions instead are especially interesting. For that analysis, two approaches are possible. The first is to determine a correlation between the variables of the state vector with the deviation of the variables of the action vector. This would resolve to a linear measure of correlation between every variable pair, but the temporal progress would not be considered and so it would not help to improve the model. The alternative approach is the filtering of the simulation states by the degree of behavior deviation. These states could be reduced to more expressive situations with the methods of cluster analysis. These error situations will be analyzed to investigate the cause of the behavior deviation.

This thesis is structured into 6 chapters. The introduction is followed by a description of the fundamentals (see chapter [chap:fundamentals]) of this work with sections about traffic simulations, parameter inference and cluster analysis. Chapter [chap:methods~m~aterials] contains the methods and materials that were developed for this project. Sections therein are an explanation of the simulation environment with its scenarios, the parameter inference implementation with its challenges and solutions followed by the analysis method for the comparison outcomes. In chapter [chap:evaluation], the evaluation strategies, experiments and results are explained. Lastly, chapter [chap:conclusions] contains a summary of the work and its results and provides proposals for future work.

Fundamentals {#chap:fundamentals}
============

[p:Procedure of Parameter Inference]

Since the task is to analyze the deviation of the driver model from the human driving behavior, the parameter configuration of that driver model belonging to the human has to be inferred first. For this application, the parametrization and the modeling of the system is predefined by the driver model, which is explained in section [sec:traffic~s~imulation]. The inverse modeling is implemented as an optimization problem as described in section [sec:optimization].

[p:model~a~nalysis~t~houghts]

In section [sec:cluster~a~nalysis] the fundamentals of cluster analysis are described. An different algorithms are explained and evaluated based on the requirements of the application.

Traffic Simulations for Virtual Environments {#sec:traffic_simulation}
--------------------------------------------

<span>lXr</span> Variable& Description&\
$i_a$& index of the considered agent&\
$A$& set of all agents in the environment\
$s$& simulation state\
$S$& set of simulation states $s$&\
$s(i_a, t)$& state of agent $i_a$ at instant of time $t$\
$R$& set of possible reactions&\
$b(i_a, s)$& behavior of an agent in a given state $s$

[tab:traffic~s~imulation~v~ariables]

Virtual environments which contain road traffic, require a realistic simulation of its participants. These type of simulations are known as traffic flow dynamics, which are bounded to time ranges of a few hours. The traffic network and infrastructure is static as well as the demands of the participants. The basic approach is the synthesis of the behavior of the drivers in union with their vehicles. This contains low level actions like acceleration, breaking, steering and signaling, but also high level actions like turning and lane changing @Treiber2010a [52].

Such an autonomous traffic participant is called *agent* and the individual behavior of this agent $i_a$ is noted as $b(i_a, s) = r$, which maps to every simulation state $s$ an individual reaction $r$. The reaction is basically a vector of the low level actions. The simulation state is notably more complex. It consists of the state of each agent $s(i_a), \forall i_a \in A$ and certain static parameters, like the semantic traffic network. Crucial for the degree of realism is the definition of the behavior function, which is in this application, based on a cognitive microscopic model. The used variables and functions are outlined in table [tab:traffic~s~imulation~v~ariables].

[p:traffic~n~etwork~d~efinition]

The traffic network model contains the geometry of the roads and crossings as well as semantic definitions like paths and rules. The geometry is represented by sequences of positions. Such a sequence is called *segment*, were a position is named *waypoint*. The order of the waypoint list notes the direction of that lane, were the width and the speed limit are additional attributes of every segment structure. There are two types of road segments. A *lane* is a segment, which represents a single line of traffic, whereas a *connector* connects exactly two lanes, for example at crossings or junctions. Lanes could have multiple incoming and outgoing connectors. So connectors are allowed to intersect each other, which is not true for lanes. For that reason every connector has a list, which contains the state of priority to every other connector of the same junction @HSHMB13.

It is non-trivial to give a valid statement about the quality of a model for traffic simulation. Alternative to the method, which is topic of this work, a common method is to define plausibility conditions, which the behavior of a simulated vehicle have to fulfill. For example, @Treiber2010a [155] defines that the vehicle has to accelerate to a desired velocity if other vehicles are far enough away. Otherwise, the acceleration should decrease or the deceleration should increase with decreasing distance to vehicle in front. Further, the distance between two vehicles should at no time below a defined.

[p:driver~m~odel]

<span>lXr</span> Variable& Description& Definition\
$x(i_a,t)$& position of agent $i_a$ on his path at time $t$& -\
$\dot{x}(i_a,t)$& velocity of agent $i_a$ at time $t$ & $\frac{dx(i_a,t)}{dt}$ [eq:velocity~d~efinition]\
$\ddot{x}(i_a,t)$& acceleration of agent $i_a$ & $\frac{d\dot{x}(i_a,t)}{dt}$ [eq:acceleration~d~efinition]\
$\dddot{x}(i_a,t)$& jerk of agent $i_a$ at time $t$& $\frac{d\ddot{x}(i_a,t)}{dt}$ [eq:jerk~d~efinition]\
$i_s$& relative position on path& -\
$g(i_a,i_s,t)$& distance to other agents on the same path& $x(i_a,t) - x(i_a, i_s,t)$\
$\dot{g}(i_a,i_s,t)$& relative speed of other agents& $\dot{x}(i_a,t) - \dot{x}(i_a, i_s,t)$\
$g_t(i_a,i_s, t)$& time-gap between vehicles& -

[tab:driver~m~odel]

Microscopic models or in particular vehicle following models, describe the behavior of individual elements to model the vehicle collective. For this purpose, vehicles assume to follow each other and stick to defined paths. Paths are for example road segments as described previously. These driving models describe the reaction of an agent, based on its local perspective of neighbor vehicles. So they are useful to model human behavior with specifics like human error, personality and mood. The approach to accomplish that, is to simulate every agent using the same model, but with individual parameter configurations. Such a configuration could contain a personality profile, as explained in section [sec:personality~p~rofile] @Treiber2010a [53-54,143].

Regarding the assumption that vehicles follow a defined path in a kind of queue, the behavior is divided into longitudinal and latitudinal models. Longitudinal models are responsible for low level actions like the control of the throttle and the brake pedal, where latitudinal models handle the steering. Lane changing models are specialized variants of the latitudinal models. In realistic and complex models these two are combined to consider even minor correlations. The applied longitudinal model is described in section [sec:IDM], where the lane-change models are topic of section [sec:MOBIL] and [sec:turning~a~nd~p~riorities].

As a consequence of the local perspective of the agent and the previously explained assumption, the basic variables per instant of time $t$ are positions on the path $x(i_a,t)$, velocities $\dot{x}(i_a,t)$ and accelerations $\ddot{x}(i_a,t)$ per agent $i_a$. Vehicles on the same path are indicated relative to the simulated agent. $i_a,{-1}$ is the vehicle behind and $i_a,{+1}$ is the vehicle in front. The relative distances or gaps $g(i_a, -1)$, $g(i_a, +1)$, velocity differences $\dot{g}$ and time-gaps $g_t$ are used more often in these models. In that formalization, the output of a longitudinal model is the value of $\ddot{x}(i_a,t+\Delta t)$. The velocities and acceleration values can be computed as shown in equation [eq:time~d~escrete~v~elocity~d~efinition]. In this application, the simulation uses equidistant time steps, which means that $\Delta t$ is constant. The related functions and variables are outlined in table [tab:driver~m~odel] @Treiber2010a [53,139].

$$\label{eq:time_descrete_velocity_definition}
	\dot{x}(i_a,t) = 
	\frac{x(i_a,t) - x(i_a,t - \Delta t)}{\Delta t}$$

### Intelligent Driver Model {#sec:IDM}

<span>lXr</span> Variable& Description& Definition\
$\delta$& acceleration exponent& -\
$g_\sigma$& minimal gap distance& -\
$t_\sigma$& minimal time gap& -\
$\dot{x}_d(i_a)$& desired velocity of agent $i_a$& -\
$\ddot{x}_d(i_a,t)$& desired acceleration for instant of time & eq. [eq:desired~a~cceleration]\
$\ddot{x}_s(i_a)$& maximal possible acceleration for agent $i_a$& -\
$\ddot{x}_{-d}(i_a)$& comfortable deceleration for agent $i_a$& -\
$g_s(i_a,t)$& safety gap distance for instant of time & $g_\sigma + \dot{x}(i_a,t)t_\sigma $\
$g_a(i_a,t)$& approaching gap distance for instant of time & eq. [eq:approaching~g~ap]\
$g_d(i_a,t)$& desired gap distance for instant of time & eq. [eq:desired~g~ap]\

[tab:idm]

The , as specified in @Treiber2010a [161-169], is a longitudinal model, which allows to calculate driver and situation specific acceleration values. It separates the behavior by certain situations. These are *free-flow*, *following* and *approaching*. The in this work considered implementation extends the with a behavior for *staying*. The decision, which one of them is to be applied is not part if this model.

The agent has a desired acceleration $\ddot{x}_d(i_a,t)$, as defined in equation [eq:desired~a~cceleration], which it would realize in free-flow. It is based on the actual velocity $\dot{x}(i_a,t)$ and converges against the desired velocity $\dot{x}_d(i_a)$. The degree of acceleration is limited by the exponent $\delta$.

For situations, in which the agent is not in free-flow, the agent has a desired gap to the leading vehicle $g_d(i_a,t)$, which is based on a speed dependent safety gap $g_s(i_a, t)$ and a special gap for approaching other vehicles $g_a(i_a,t)$. The safety gap represents the precaution for the reaction time, where the approaching gap depends on the velocity difference to the car ahead and a comfortable deceleration $\ddot{x}_{-d}(i_a)$. That desired gap is defined in equation [eq:desired~g~ap]. So the actual acceleration depends, aside from the desired acceleration, on the ratio between the gap to the leading vehicle and the desired gap, as defined in equation [eq:IDM~a~cceleration]. It considers free-flow, approaching and follow situations. This smooths transitions between the situations limits (the jerk $ \dddot{x}(i_a,t) $ see table [eq:desired~a~cceleration]) as well.

$$\begin{aligned}
	\ddot{x}_d(i_a,t) =\;&
	1
		- 
		\left(
			\frac{\dot{x}(i_a,t)
		}{
			\dot{x}_d(i_a)
		} \right)^\delta
	\label{eq:desired_acceleration}
	\\
	g_a(i_a,t) =\;&
	\frac{
		\dot{x}(i_a,t)\dot{g}(i_a,+1,t)
	}{
		2\sqrt{\ddot{x}_s(i_a) \ddot{x}_{-d}(i_a)}
	}
	\label{eq:approaching_gap}
	\\
	g_d(i_a, t) =\;&
	g_s(i_a,t) + max \left(
		0,
		\dot{x}(i_a, t)t_\sigma +
		g_a(i_a,t)
	\right)
	\label{eq:desired_gap}
	\\
	\ddot{x}_{IDM}(i_a,t+1) =\;& 
	\ddot{x}_s(i_a) \left[
		\ddot{x}_d(i_a,t)
		- 
		\left(
			\frac{g_d(i_a, t)
		}{
			g(i_a, +1, t)
		} \right)^2
	\right]  
	\label{eq:IDM_acceleration}\end{aligned}$$

The acceleration for the staying situations are simply the comfortable deceleration.

To put it all together: The model parameters are the desired velocity, an acceleration exponent, the maximum acceleration, a comfortable and a maximum deceleration, a minimum gap distance and the time (see table [tab:idm]).

### Minimizing Overall Braking Induced by Lane change {#sec:MOBIL}

<span>lXr</span> Variable& Description& Definition\
$\ddot{x}_{-s}(i_a)$& maximal possible deceleration of agent $i_a$& -\
$\ddot{x}_\theta(i_a)$& lane change threshold of agent $i_a$& -\
$i_l$& neighbor lane index& -\
$\ddot{x}_\beta(i_a, i_l)$& advantage bias of neighbor the agent’s current lane& -\
$\phi(i_a)$& politeness of agent $i_a$& eq. [eq:politeness~d~etermination]\
$\ddot{x}(i_a,i_s,i_l,t)$& acceleration of agent on neighbor lane $i_l$ and virtual position $i_s$& -\
$\ddot{x}'(i_a,i_s,i_l,t)$& acceleration of concerned agent after lane change to $i_l$& -\
$b(i_a,i_s,i_l,t)$& benefit for concerned agent& eq. [eq:MOBIL~c~onstraint]\
$b(i_a, i_l, t)$& total benefit from lane change to $i_l$& eq. [eq:lane~c~hange~b~enefit]\
$i_o$& index of obstacle agent& -\
$x_o(i_a,i_o,i_s,i_l)$& stopping point for the opposing agent& -\
$g_o(i_a,i_s,i_l,t)$& possible stopping distance of opposing agent& -\
$t_o(i_a, i_o)$& time till the agent leaves the lane in opposing direction& -\

[tab:mobil]

Whereas the intelligent driver model provides the acceleration and deceleration reaction of an agent, the agent’s steering is not considered. A simple solution regulates the steering by the vehicle’s deviation from its path. More complex are discrete decisions like lane changes.

The implemented lane change model @Treiber2010a [201]@Krueger2013 [37-44] is called . It uses continuous decision trees to check if a lane change is mandatory (*Mandatory Lane Change*), for example on blocked lanes or for navigation reasons or if a lane change is advantageous (*Discretionary Lane Change*). An evaluation if the lane change would be safe for all concerned agent is obligatory.

Certain variables and functions are used in , these are summarized in table [tab:mobil] and explained in the following.

The model is based on a few criteria. Only those lane changes are allowed, which do not force any vehicle to decelerate more than the maximum deceleration parameter $\ddot{x}_{-s}(i_a)$ to fulfill the safety. Another is the incentive criteria, which means that the most useful decision has to be chosen. A common measure for utility is the similarity between desired and the possible future reactions. However, it could also include thresholds, rule-enforcing or politeness factors, which prevent oscillating, rule violations and/or accidents.

The model predicts the acceleration of the vehicles around the considered vehicle $\ddot{x}(i_a,i_s,i_l,t)$ and predicts the accelerations in case of an lane change $\ddot{x}'(i_a,i_s,i_l,t)$ as well. The advantage of the other car around $b(i_a,i_s,i_l,t)$ (see eq. [eq:MOBIL~c~onstraint]), multiplied with a politeness factor $\phi(i_a)$ for all affected agents (eq. [eq:lane~c~hange~b~enefit]) minimizes the total sum of necessary deceleration or maximizes the total advantage (eq. [eq:lane~c~hange~d~ecision]) of a lane change. This factor $\phi(i_a)$ determines the degree of consideration for other drivers, which exceeds safety aspects. A value $\phi(i_a) = 0$ results in egoistic behavior, while $\phi(i_a) = 1$ means that the own convenience is irrelevant.

$$\begin{aligned}
\label{eq:MOBIL_constraint}
	b(i_a,i_s,i_l,t) =\;&
	\ddot{x}'(i_a,i_s,i_l,t) - \ddot{x}(i_a,i_s,i_l,t)
	\\
	b(i_a, i_l, t) =\;&
	[1 - \phi(i_a)] [\ddot{x}'(i_a,t) - \ddot{x}(i_a,t)]
	\nonumber\\& + \phi(i_a) [b(i_a,-1,0,t) + b(i_a,-1,i_l,t)]
	\label{eq:lane_change_benefit}
	\\
	\ddot{x}_\theta(i_a) <\;&
	max( \{ b(i_a, i_l, t) | \forall i_l \} )
	\label{eq:lane_change_decision}\end{aligned}$$

The lane bias $\ddot{x}_\beta(i_a, i_l)$ models a preference for certain lanes. This could be due to the demand to use the right-most lane or the exceptional usage of a lane of the opposite direction.

For using the opposite lane, there are more conditions. There is a stopping point $x_o(i_a,i_o,i_s)$ for the obstacle on the targeted lane, which an opposing agent on that lane must not reach until the simulated agent changes back to its original lane. Further, a stopping distance $g_o(i_a,i_s,i_l,t)$ for the opposing agent is defined, which represents the movement at maximum deceleration. The difference of the opposing agent’s distance to the stopping point and its stopping distance is used for determining the safety. If it is positive, the lane change is safe (see eq. [eq:opposite~l~ane~s~afety~c~ondition]).

Besides the additional safety condition, the lane change benefit for lanes in opposite direction is a bit different. First, there is only one other agent involved, so the total advantage is defined differently (see eq. [eq:opposite~l~ane~c~hange~b~enefit]). Second the acceleration of this agent is changed. It is based on the approaching term with an adapted headway distance (see eq. [eq:opposings~h~eadway]). It depends on the considered agent’s time on the opposing lane $t_o(i_a, i_o)$ (see eq. [eq:oppsite~l~ane~t~ime]). The worst case is assumed: The opposing agent accelerates to the desired velocity, as quickly as possible (see eq. [eq:opposing~m~ovemet~t~ill~m~ax~a~cc]) and if the time gap is not completely used, the remaining time it travels with the desired acceleration (see eq. [eq:opposings~m~ovement~o~n~m~ax~a~cc]) @Krueger2013 [42-44].

$$\begin{aligned}
	t_o(i_a, i_o) =\;&
	\sqrt{
		\frac{
			2 x_o(i_a,i_o,i_s, i_l)
		}{
			\ddot{x}_s(i_a)
		}
		+
		\frac{
			\dot{x}(i_a)^2
		}{
			\ddot{x}_s(i_a)
		}
	}
	-
	\frac{
		\dot{x}(i_a)
	}{
		\ddot{x}_s(i_a)
	}
	\label{eq:oppsite_lane_time}
	\\
	g_o(i_a,i_s,i_l,t + t_0(i_a,i_o)) = \;&
	\label{eq:opposings_headway}
	\\
	&\frac{1}{2}
	\ddot{x}_s(i_a, i_s, i_l) 
	\; min( \{ t_{\dot{x}}(i_a, \dot{x}_d(i_a) ), t_o(i_a, i_o) \} )^2
	\label{eq:opposing_movemet_till_max_acc}
	\\
	&+
	\ddot{x}_d(i_a, i_s, i_l) 
	\; max({0,t_o(i_a, i_o) - t_{\dot{x}}(i_a, \dot{x}_d(i_a) )})
	\label{eq:opposings_movement_on_max_acc}\end{aligned}$$

$$\begin{aligned}
	x_o(i_a,i_o,i_s,i_l) <\;&	x(i_a,i_s, i_l, t) - g_o(i_a,i_s,i_l,t)
	\label{eq:opposite_lane_safety_condition}
	\\
	b(i_a, i_l, t) =\;&
	(1-\phi(i_a)) (\ddot{x}'(i_a,t) - \ddot{x}(i_a,t)) + \phi(i_a) b(i_a,-1,i_l,t)
	\label{eq:opposite_lane_change_benefit}\end{aligned}$$

### Personality and Emotion Profiles {#sec:personality_profile}

<span>lXr</span> Variable& Description& Definition\
$p(i_a)$& personality profile of agent $i_a$& $\in \mathbb{R}^5, 0 \leq p(i_a)_i \leq 1$\
$p_n(i_a)$& neuroticism of agent $i_a$& $p(i_a)_1$\
$p_e(i_a)$& extraversion of agent $i_a$& $p(i_a)_2$\
$p_o(i_a)$& openness of agent $i_a$& $p(i_a)_3$\
$p_a(i_a)$& agreeableness of agent $i_a$& $p(i_a)_4$\
$p_c(i_a)$& conscientiousness of agent $i_a$& $p(i_a)_5$\
$m_+(i_a, t)$& positive emotional state& $\in \mathbb{R}^4, 0 \leq d_3 \leq 1$\
$m_-(i_a, t)$& negative emotional state& $\in \mathbb{R}^4, 0 \leq d_3 \leq 1$\
$m_c(i_a,t)$& current emotion level& $m(i_a,t)_1$\
$m_m(i_a,t)$& last maximum level& $m(i_a,t)_2$\
$m_r(i_a,t)$& degree of regression& $m(i_a,t)_3$\
$m_l(i_a,t)$& regression latency& $m(i_a,t)_4$\
$f_+$& personality effect on positive emotion& $\in \mathbb{R}^5$\
$f_-$& personality effect on negative emotion& $\in \mathbb{R}^5$\
$f_\phi$& personality effect on politeness& $\in \mathbb{R}^5, -1 \leq f_{\phi j} \leq 1$\
$e$& event& $\in \mathbb{R}^2$\
$s_+(e)$& positive event sensation factor& $\in \mathbb{R}^5$\
$s_-(e)$& negative event sensation factor& $\in \mathbb{R}^5$\
$s_m$& minimal sensation factor&-\
$s_c$& sensation scale factor&-\

[tab:emotion]

Besides the vehicle following model and the lane change model, the considered simulation features an integrated personality and emotion model. Personality is defined as @allport1959 [49]:

> “Personality is the dynamic order of that psychophysical systems of an individual, that determine unique adaptations to his environment.”

Hence, all individual agent parameters that influence the behavior, except vehicle parameters, should be based on a personality profile. To accomplish that, perceptions from psychology are used, which covers personality traits, distinctions, variability and distinctions in variability in personality.

[p:basic~p~ersonality]

Personality traits and distinctions are quantified by the , which contains five independent attributes: neuroticism, extraversion, openness, agreeableness and conscientiousness. Concrete values for profile traits, which are based on this model, depend on the used survey method, which defines the scale and value ranges. Basically, the individual deviations from the average are used to model individual deviations in behavior.

[p:traffic~r~elated~p~ersonality]

As described by @Treiber2010a [54], personality profiles are useful to explain human behavior in traffic, including estimation errors, reaction time and anticipation. As defined in @Krueger2013 and @Seele2012a a mapping from a -based profile to a set of and parameters reduce unrealistic behavior in certain situations.

[p:personality~d~ynamics]

The variability in personality in this application is concerned with the dynamics of emotions and moods; not long term evolution. The focus is on the influence of certain events to the behavior and their regression. For the synthesis of emotions in this simulation, the model is used (see @Krueger2013 [12-13]). This model contains a dynamic emotion level, which separates two independent dimensions. One for positive and one for negative emotions. Each dimension consists of variables for the current level $m_c$, the last maximum $m_m$, for linear regression $m_r$ and for a regression latency $m_l$. The only time dependent variable is the current emotion level $m_c(i_a, t)$. Its change over time is defined in equation [eq:emotion~r~egression]. The linear regression variable determines the decrease per time.

$$\label{eq:emotion_regression}
	m_c(i_a, t + 1) =
	max\left(\begin{Bmatrix*}[l]
		0, \\ 
		m_c(i_a, t) - m_r(i_a), \\
		\frac{m_c(i_a, t)^2}{m_m(i_a, t)+10^{-m_l(i_a)}}
	\end{Bmatrix*}\right)$$

[p:AD~A~CL~F~FM~m~apping]

Based on the personality profile $p(i_a)$ and the emotional state $m_+(i_a,t), m_-(i_a,t)$, a dynamic personality $p(i_a,t)$ is determined as defined in equation [eq:AD~A~CL~F~FM~m~apping], were the elements of $f_+, f_- \in \mathbb{R}^5$ represent the effect of an emotion on a personality trait.

$$\label{eq:AD_ACL_FFM_mapping}
	p(i_a, t)_j = p(i_a)_j + f_{+j} m_{+c}(i_a) + f_{-j} m_{-c}(i_a)$$

[p:FFM~A~D~A~CL~m~apping]

The emotional state evolves based on certain events and the previously explained regression. The sensation of those is influenced by the personality as well. There is a vector of sensation factors for positive and negative events, which weights the influence of certain personality attributes. Further $s_c$ notes a global scaling factor for emotion influence and $s_m$ defines a scaled minimum to prevent the sensation of double negative events. This sensation is shown in equation [eq:positive~e~vent~s~ensation] and [eq:negative~e~vent~s~ensation]. The change of the emotion level by an event is defined in equation [eq:emotion~c~hange].

[p:emotional~e~vents]

One of the currently implemented emotional events is waiting. It generates negative emotions, whose intensity depends on whether the agent ahead is stationary or the agent is forced to wait by another agent. Further, if the agent is unable to accelerate as desired, negative emotions are perceived. The only implemented source of positive emotions is yielding on other agents to the simulated driver.

$$\begin{aligned}
	s_+(i_a, e, t) =\;&
	max\left(\begin{Bmatrix*}[l]
		e_+ \; s_c \sum_{j}^{\{n,e,o,a,c\}} {
			p_j(i_a, t) s_{+j}(e)
		},\\
		e_+ \; s_m
	\end{Bmatrix*}\right)
	\label{eq:positive_event_sensation}
	\\
	s_-(i_a, e, t) =\;&
	max\left(\begin{Bmatrix*}[l]
		e_- \; s_c \sum_{j}^{\{n,e,o,a,c\}} {
			p_j(i_a, t) s_{-j}(e)
		},\\
		e_- \; s_m
	\end{Bmatrix*}\right)
	\label{eq:negative_event_sensation}
	\\
	m(i_a, t + 1, e) =\;&
	m(i_a, t) + s(i_a, e, t)
	\label{eq:emotion_change}\end{aligned}$$

As the emotion model extends the personality model . The is used for the parametrization of the longitudinal model , the lane change model and the deadlock prevention model, which is explained in section [sec:turning~a~nd~p~riorities].

[p:FFM~M~OBIL~m~apping]

The politeness factor for the lane change model is determined as the scalar product of the personality profile, which is weighted by $f_\phi$ (see table [tab:emotion]). The politeness is limited to a range between $0$ and $1$, as shown in equation [eq:politeness~d~etermination].

$$\label{eq:politeness_determination}
	\phi(i_a, t) = min\left( \left\lbrace
		1, max\left( \left\lbrace
			0, \frac{
				1 + \sum_{j}^{\{n,e,o,a,c\}} p_j(i_a, t) f_{\phi j}
			}{
				2
			}
		\right\rbrace \right)
	\right\rbrace \right)$$

### High Level Behavior {#sec:high_level_behavior}

The high level behavior of the agent solves problems like determining, which agent is the lead, which the follower and which the obstacle. Further the decision which term to apply is made by the high level behavior.

The agent’s cognition is based on the road network data structure. Every agent in the simulation is registered on the current road segment it is currently driving on. The simulated agent queries the registries of its current and its successive segments and decides based on their distances and states.

The driving decision is organized into strategies, which apply in specific situations. If it was evaluated that a lane change is mandatory or discretionary, the lane change strategy is used. If a connector segment is ahead, the crossroads strategy will decide on the acceleration. In the remaining cases a default strategy is used.

The agent’s steering is almost like the desired $y_d(i_a, t)$, which is calculated by the current strategy. The change is an applied inertia, which is implemented a weighted mean of the desired and previous steering. The weight coefficient is noted as $\epsilon$ in equation [eq:steering~i~nertia].

$$\label{eq:steering_inertia}
	y(i_a, t) = y_d(i_a, t) (1-\epsilon) + y(i_a, t-1) \epsilon$$

#### Default Strategy {#sec:default_strategy}

The default strategy uses the -follow term, if a lead agent was detected. If the agent is forced to be stationary, for example to simulate parking cars, -stay is used. Except the previous cases, the agent will be in free-flow.

#### Lane Change Strategy {#sec:lane_change_strategy}

The lane change process is separated into four phases. First, the driver approaches the obstacle while the lane change is not feasible or the evaluated advantage is not high enough. In the second phase, the agent changes on to the other lane. If this is a lane in the opposing direction, the strategy is locked, which means, that it wont be aborted. If it is not, the lane change is finished.

If the agent is on the opposing lane, it is in the next phase. In that stay over phase, it is evaluated for further obstacles using the previously explained method if it is feasible to overtake them as well. If is not feasible or there is no more obstacle, the agent will switch to the next phase. In that phase it changes back to it’s original lane. After that the last phase is active, which unlocks the strategy.

In the phases change over, stay over and change back, the steering model uses other positions instead of the next waypoint ahead. These positions depend on the geometries of the obstacle and the driver’s vehicle.

#### Crossroads Strategy {#sec:turning_and_priorities}

The behavior at junctions and crossroads without signaling follows a simple order. On a predefined distance to the connector road segments, the priorities to other connectors, and the vehicles on it, are checked. In the next step, it will be checked, if the prioritized agents would interfere with the considered agent by evaluating their distance and velocity and further their time which they require to pass. If this is the case, the agent approaches the last waypoint of the incoming lane and waits until the junction is free. In that second phase, the agent behaves in that crossroads strategy as in the default, but it is still locked to prevent blocking the crossroads by waiting for another prioritized agent.

[eq:deadlock~r~esolution]

<span>lXr</span> Variable& Description& Definition\
$n_w(i_o)$& number of waiting agents at obstacle $i_o$& -\
$t_w(i_{a,w})$& idle time of agent $i_{a,w}$& -\
$g_y(i_{a,w},i_o)$& distance range for yield requests.& $t_o(i_{a,w},i_o) \times \dot{x}_s(i_{a,w})$\
$t_{w,s}$& maximal idle time& -\
$\phi_\theta$& politeness threshold for yield& -

[tab:high~l~evel~b~ehavior]

There are some cases, where this strategy doesn’t work without any adaption. Some agents could wait for each other, caused by incomplete priority rules. These cases are called *deadlock*, which the model is able to solve. The method, as described in @Krueger2013 [45-48], iterates over the waiting agents to find the source that forces the agents to stay. If the agent itself is part of this chain, this is a dead-lock situation, which the agents are able to solve with a kind of voting. Every agent in the dependency circle compares their politeness and the driver with the highest value passes on it’s right of way.

Other cases of deadlocks or *pseudo-dead-locks*, are very long idle times, for example, caused by a continuous flow of prioritized agents. Another could be a mandatory change to the opposite lane without safe gaps for a long period of time. In these pseudo-deadlocks, the waiting agent sends a yield request to every opposing agent in range $g_y(i_{a,w}, i_o)$. That range is the product of the time that the agent would need to pass the obstacle $t_o(i_{a,w}, i_o)$ and the maximum velocity $\dot{x}_s(i_{a,w})$. A yield request will be accepted, if the context depended politeness $\phi_y(i_{a,y}, t)$ is bigger than the urgency $\chi(i_{a,w}, i_o,  t)$ of the waiting agent. This politeness factor, as defined in eq. [eq:yield~p~oliteness], is the product of the agent’s politeness and the necessary deceleration. The urgency, as defined in eq. [eq:urgency], corresponds to the relation between the maximum idle time $ t_{w,s} $, the sum of the number of waiting agents $n_w(i_o)$, and the idle time of the first waiting agent $t_w(i_{a,w})$. The related variables and functions are outlined in table [tab:high~l~evel~b~ehavior].

$$\begin{aligned}
	\phi_y(i_{a,y}, t) =\;& 
	\phi(i_{a,y}, t) \left( 
		1 + \frac{
			max(\{
				0,
				\ddot{x}'(i_{a,y})
			\})
		}{
			\ddot{x}_{-s}(i_{a,y})
		}
	\right)
	\label{eq:yield_politeness}
	\\
	\chi(i_{a,w}, i_o, t) = \;&
	max\left(\left\lbrace
		\phi_\theta,
		1 - \frac{
			t_w(i_{a,w}) + \frac{
				n_w(i_o)
			}{
				2
			}
		}{
			t_{w,s}
		}
	\right\rbrace\right)
	\label{eq:urgency}\end{aligned}$$

Parameter Inference by Optimization {#sec:optimization}
-----------------------------------

Optimization algorithms are useful to solve problems, which have many possible solutions with multiple variables, where the results change significantly based on the combination of these variables. A first distinction of different approaches are numeric and analytic methods to determine the optimal solution of a problem. Numeric algorithms execute an iterative trail and error procedure, meanwhile analytic methods are based on the analysis of the functional relation between the variables and the objective. So, depending on the concrete problem, special methods exist to determine the optimal solution. If the functional relation between the variables and the objective is unknown, it is necessary to experiment on the real object or on a model. For example activate it with certain parameters and analyze the response. This relation could be thought of as multidimensional surface. The dimensions correspond to the variables and the cost depends on the objective. A valley in that surface is a solution, whose neighbors have higher costs, so it represents a local minimum. The global minimum is the single solution with the lowest cost value. If there is only one local minimum, this is a convex problem, Otherwise it is multi-modal, which is more difficult to solve.

One approach is to use an approximated model of the functional relation for that analysis, but another is to test and score different solutions. For that, it must be possible to vary the parameters and to measure the quality of a solution. This is a meta-heuristic optimization method, which does not require any prior information about the problem. However, certain generic information is necessary instead: a solution (for example as tuple) and a cost function, which maps a score to a solution. Such meta-heuristic methods determine local minima as requested but the drawback is that for mutli-modal problems it is not guaranteed that the global minimum is found. Another drawback is that the calculation is expensive. However, the efficiency of an analysis of an approximated model can be insufficient as well. It depends on the specific case, because a good approximation could be expensive as the experimental optimization.

[p:optimization~s~olution]

A solution in this application is a tuple of real numbers $p \in \mathbb{R}^j$, which corresponds to a personality profile as defined in section [sec:personality~p~rofile]. Further, it is unknown whether the problem has a convex shape. Therefore methods are required which are applicable to multi-modal problems. This restricts the choice of the applied optimization method.

[p:cost~f~unction]

The cost function $c(p) : \mathbb{R}^j \rightarrow \mathbb{R}_+$, which determines the quality of a solution, is crucial for the application. If the optimization is a maximization, the cost function has to return a larger value, if the solution is better. This parameter inference application minimizes the difference between modeled data and measurements, so the cost function has to return a lower value for a better solution.

Optimization objective is the deviation of modeled and measured behavior, but the parameter is the personality, so it could be useful to focus on the personality based deviations if it is possible to detect them. Certain cost functions are discussed in section [sec:profile~a~pproximator]. The difference of the behavior should be based on normalized values. Common normalization methods are explained in section [sec:similarity].

If it is possible to differentiate or approximate the derivative of this cost function, then gradient based methods could be applied, which are in general more efficient @Gottwald, but rather unstable if the problem contains several local minima. If the derivative cannot be found, another approach has to be chosen. Candidates are enumerative, monte-carlo and evolutionary algorithms. *Enumerative algorithms* test a defined grid of equidistant solutions, which is very expensive for bigger problems. *Monte-Carlo algorithms* use a random distribution of tested solutions, which is also expensive. *Evolutionary algorithms* mimic the natural method of variation and selection, which improves fully random procedures by using the results of previous iterations. The method takes a set of solutions and selects the best using a cost function for the next iteration. That category consists of *genetic algorithms*, which recombine solutions and swap components of them for variation. That solutions must have the form of bit-strings or more complex data structures, but not tuples of real numbers as in this application. Unstructured real or discrete numbers are the domain of *evolutionary strategies*, which limit the solution variation to mutation recombination operations. Hence evolutionary strategies are used in this work.

[p:fundamentals~o~f~e~volution~s~trategies]

<span>lXr</span> Variable& Description&\
$p_a$& ancestor instance\
$p_c$& child instance\
$r$& stochastic modification\
$n_a$& number of ancestors\
$n_s$& number of survivors\
$n_{g}$& number of generations\
$n_p$& population size

[tab:evolution]

The terms of this method are defined analogous to the biological example of evolution. An *individual* is a solution for the optimization problem and a method iteration is called *generation*. The set of individuals of the same generation is a *population*. Varied copies of individuals are *children*. Since evolution is about the survival of the fittest, the cost function is called *fitness function* @kost2003optimierung.

[p:random~n~umbers] This method makes use of random processes, which are defined as follows. A continuous uniform distributed random variable $U$ can attain every value in the interval $r \in [a,b] \cap \mathbb{R}$. The probability density of that variable is thereby constant. Continuous normal distributed random variables $N$ (see eq. [eq:normal~d~istributed~v~ariable]) require in addition to the interval limits: a mean value $\bar{n}$ and a standard deviation $\sigma$ @kost2003optimierung [88-90].

$$\label{eq:normal_distributed_variable}
	N(\bar{n}, \sigma) = \frac{1}{\sqrt{2 \pi \sigma^2}}^{e-\frac{(n-\bar{n})^2}{2\sigma^2}}$$

[p:mutation]

A mutation is a copy with variation, were the modification is commonly normal distributed. It corresponds to the similarity between parent and child @kost2003optimierung [99-100] as defined in equation [eq:mutation]. The standard deviation $\sigma$ is a kind of step size of the variation (see eq. [eq:mutation~v~ariation]). The step size is crucial for evolution strategies and iterative optimization methods in general, because it controls the total runtime and the precision of the procedure. A possible value of that parameter is shown in equation [eq:mutation~s~tep~n~ormalization]. It normalizes the total step size over all dimensions by their expected value. An individual step width per solution dimension is also possible, but in this application not useful, because the solutions are already normalized. However, an individual step width per generation is an option. For example, a linear decreasing value defines a kind of corridor where the optimum is searched. The number of generations thereby defines the precision. Another approach is based on the *1/5-rule*. It depends on the average probability of an improving mutation or recombination. If the quotient of improving variations is over that ratio, the step size will be decreased, else it will be increased. The change of the step size should be $0.85$ @kost2003optimierung [118].

$$\label{eq:mutation}
	p_c = p_a + r$$

$$\label{eq:mutation_variation}
	r
	= 
	\begin{bmatrix}
		r_0\\
		r_1\\
		\vdots\\
		r_j\\
	\end{bmatrix}
	= 
	\begin{bmatrix}
		N(0,\sigma)\\
		N(0,\sigma)\\
		\vdots\\
		N(0,\sigma)\\
	\end{bmatrix}
	= 
	\sigma\begin{bmatrix}
		N(0,1)\\
		N(0,1)\\
		\vdots\\
		N(0,1)\\
	\end{bmatrix}$$

$$\label{eq:mutation_step_normalization}
	\sigma := \frac{1}{\sqrt{j}}$$

[p:recombination]

A recombination is a copy with properties of both parents. The parents have to be randomly chosen from the population, with a continuous uniform distribution @kost2003optimierung [104]. The number of ancestors $n_a$ commonly equals the population size $n_p$ @kost2003optimierung [107]. There are two ways of recombination. *Discrete recombination* is a method where one random variable per solution dimension decides whose parent value will be element of the child (see eq. [eq:discrete~r~ecombination]). And *intermediate recombination* is the mean per dimension as defined in equation [eq:intermediate~r~ecombination].

$$\begin{aligned}
p_{c,j} =\;& \left\lbrace \begin{array}{llllll}
	p_{a_1, j}&	0&						\leq& r& <& \frac{1}{n_a}\\
	p_{a_0, j}&	\frac{1}{n_a}&			\leq& r& <& \frac{2}{n_a}\\
	\vdots\\
	p_{a_{n_a}, j}&\frac{n_a - 1}{n_a}&	\leq& r& \leq& 1\\
\end{array}\right.
\label{eq:discrete_recombination}
\\
p_{c,j} =\;&\frac{1}{n_a}\sum_{i=1}^{n_a}p_{a_i, j}
\label{eq:intermediate_recombination}
\end{aligned}$$

[p:optimization~a~bort~c~riteria]

Another problem is when to stop the process. Since it is not possible to identify the global minimum, finding this optimum is not an option. So other criteria are required to decide when to abort. One option is a threshold, which defines if a solution is good enough to stop searching. Another approach is the detection of convergence. For example the similarity of solutions between certain generations. But this is not useful if the step size is defined. Alternatively the similarity over a wider range of generations could be a significant measure @kost2003optimierung [111]. Common for evolution strategies are a predefined number of generations $n_g$, for example, in relation to the definition of the step size @segaran2008kollektive [278].

[p:evolution~s~election]

The *mutation selection strategy* is a simple evolution strategy where one instance will be varied by mutation to build a new population. The selection step is simply the selection of one instance with the best fitness. This approach is simple and efficient, but only for convex problems, because it tends to get stuck at the first local minimum found.

[p:population~s~trategies]

*Population strategies* use a bigger population size $n_p$, which enable the use of recombination as well as mutation. An additional variable in this method is the number of selected instances for the next population $n_s$. A higher number of survivors per generation increases the stability of the method as well as it increases the cost. This variable determines the evolutionary pressure $\frac{n_p}{n_s}$. Further, there are several variants of this population strategies. One classification property is whether the parent solutions can be selected for the next generation. If an instance survives over multiple generations, the threat of sticking in a local minimum exists. Another issue is the adaption of the step size. Besides the previously explained deterministic change, the step size variable could be optimized like the solution variables with the exception that the mutations have to be multiplied instead of added to avoid negative steps. This method is called *mutative step size control* @kost2003optimierung [135].

[p:multi~p~opulation~s~trategies]

<span>lXr</span> Variable& Description&\
$n_{p,P}$& number of populations\
$n_{a,P}$& number of ancestor populations\
$n_{s,P}$& number of survivor populations\
$n_{g,P}$& number of meta generations\

To increase the probability of finding the global optimum, the optimization could be repeated several times with different start values and individual random numbers. This and other ideas are the foundation of *multi population strategies*. The basic concept is the application of evolution to several populations. A set of $n_{p,P}$ populations will be generated, which run isolated for $n_{g,P}$ generations, which means that no recombination or selection between different populations is allowed. After that the $n_{s,P}$ fittest populations have to be selected for the next generation of that meta evolution. The fitness of a population could be defined as the value of the fittest individual per population or the average fitness. The parameters and variables, used in the definition on evolution strategies are outline in table [tab:evolution].

Cluster Analysis {#sec:cluster_analysis}
----------------

<span>lXr</span> Variable& Description& Definition\
$C$ & cluster of states& -\
$n_C$ & number of clusters& -\
$i_C$ & cluster index & -\
$C(i_c)$ & cluster with index $i_C$ & -\
$\vec{s}$ & classification object & -\
$S$ & set of all objects & -\
$n_{s,C}$ & number of objects in cluster $C$ & -\
$i_{s,C}$ & object index in cluster $C$& -\
$\vec{s}(C,i_s)$ & object with index $i_s$ in cluster $C$& -\
$r(C)$ & representative of cluster $C$& -\
$n_v$ & number of object dimensions & -\
$i_v$ & object dimension index & -\
$v(s, i_v)$ & value of state $s$ in dimension $i_v$ & -\
$\bar{v}(C, i_v)$ & mean of cluster $C$ in dimension $i_v$ & eq. [eq:mean~o~f~c~luster]\

[tab:cluster~a~nalisis]

[p:cluster~a~nalysis~i~ntroduction]

As the objective is to detect situations, which are not considered by the current driver model, it is necessary to investigate which situations could occur in traffic. Situations differ from each other by the value of certain attributes. These attributes have their origin in the simulation state and its time curve. In this project, a situation is defined as a generalized set of similar simulation states. How similarity is defined is presented in section [sec:similarity] where some similarity measures are explained.

[p:cluster~a~nalysis~o~bjective]

Cluster analysis is a method to build groups of things, persons or ideas, which belong closely together. So the objective is to aggregate a set of objects into homogeneous groups and to separate heterogeneous objects. In other words, it is the detection of an empiric classification. This is an unsupervised machine learning problem. These sets of objects, also called clusters, are basically dense point clouds in an $p$-dimensional space, which are separated by regions with low density @bacher2010clusteranalyse [15-16] @segaran2008kollektive [33-34].

[p:cluster~a~nalysis~a~pplication]

In this application, a subset of the simulation state $\vec{s}$ is a classification object and the situations $C$ are the resulting clusters. So a situation is a set of simulation states and the $p$ dimensions equal the dimensionality $n_v$ of the state vector.

The cluster analysis methods are used to empirically gather situations, that already occurred, from recorded simulation states and help to determine which variable identifies the behavior deviation. This application has certain specifics, which should be considered during the choice of the method. Certain Algorithms are explained in section [sec:cluster~a~lgorithms].

The method used is an explorative cluster analysis problem, because the number $n_C$ and the properties of the clusters, like shape or size, are unknown. The data in this case could contain overlapping clusters, because behavior deviation is a consequence of the negligence or wrong usage of certain variables. Overlapping means that clustering results contain objects which could belong to multiple clusters. In certain cases, variables could cause a behavior deviations over a wide range of states and such deviations could be the result of more than one error. As explained in section [p:overlapping~c~lusters], overlapping clusters have drawbacks in their interpretability. Since it is the objective to find variables, which are responsible for behavior deviation, these variables could be determined in different situations without important drawbacks. So algorithms with non-overlapping solutions are advantageous in this application and will be used.

The cluster analysis related functions and variable definitions are outlined in table [tab:cluster~a~nalisis].

### Similarity Measures {#sec:similarity}

Similarity of objects can be expressed as the similarity of their attributes or alternatively as the similarity of relations between objects. Un-similarity or distance is expressed by the function $\delta: \mathbb{R}^{n_v} \times \mathbb{R}^{n_v} \mapsto \mathbb{R}$, whose return value increases, if the compared objects are more different. There are various methods to determine the object similarity. Since the task is to cluster simulation states, which are in general multidimensional rational numbers, methods for dichotomous, nominal and ordinal variables can be ignored. Common measures are *city block metric*, *euclidean distance*, *squared euclidean distance* and the *chebychev distance*. These are distinct in the weight of differences in single variables and the scale of the output. If the task would be a variable-based cluster analysis instead of an object oriented one, correlation measures like the *Q-correlation* would be useful @bacher2010clusteranalyse [20,219-220].

Based on the similarity measure and the analysis method, the shape of found clusters changes. For example, they tend to find spheric or plain clusters. If prior knowledge about the classification model of the data exists, it should be considered in the method selection @ester1996density.

The *squared euclidean distance*, as defined in eq. [eq:squared~e~uclidean~d~istance], is required by certain methods. These are the *k-means*, *median*, *zentroid* and *ward-method*, which are explained in section [sec:cluster~a~lgorithms]. This measure is relatively sensitive to variations in single dimensions. It warps the scale, which should be no drawback in this application @bacher2010clusteranalyse [155,220].

$$\label{eq:squared_euclidean_distance}
	d^2(\vec{p}, \vec{q}) = \sum_{i_v = 0}^{n_v}{
		[v(p,i_v) - v(q,i_v)]^2
	}$$

[p:cluster~v~alidation~f~unctions]

Besides the similarity measures, there is another class of functions which are used for cluster analysis. Since humans are unfit to validate clustering solutions in more than three dimensions, validation functions are necessary. This function $\beta$ maps a score to every clustering solution of a dataset $D$. There are cluster analysis methods which use such functions for a kind of optimization-based approach. An example for a validation function is the *within cluster sum of squares* as defined in [eq:within~c~luster~s~um~o~f~s~quares], which is based on the *squared euclidean distance* (eq. [eq:squared~e~uclidean~d~istance]). It returns a value near zero if the homogeneity within the clusters is maximal, but the result of this function has the condition that the number of clusters is fixed, because the value decreases with an increasing number of clusters.

$$\begin{aligned}
	\label{eq:within_cluster_sum_of_squares}
	S_{w} = & 
	\sum_{i_C = 0}^{n_C}{
		\sum_{i_s = 0}^{n_{s,C}}{
			\sum_{i_v = 0}^{n_v}{
				[
					s(C(i_C),i_s)_{i_v} - r(C(i_C), i_v)
				]^2
			}
		}
	}\end{aligned}$$

[p:weighting~a~nd~t~ransformation]

Variables that are used in the cluster analysis and specifically in the similarity measurement have to be commensurable. That means that the variables must have the same measurement unit and nouveau and they must not be hierarchic @bacher2010clusteranalyse [175-176].

In this application, variables of distances, speed and time are possible, so the measurement unit is not equal. The measurement nouveau should not be an issue and the variables are not hierarchic as well.

To solve the unit issue, the variables have to be weighted or transformed before the analysis, for example, by empiric methods like *min-max-normalization* or *z-transformation*. The main differences between the empiric weighting methods are shown in figure [img:normalization.pdf].

A simple option to achieve this goal is the min-max-normalization (see equation [eq:def:minmax]). It requires prior knowledge of the desired range [$ min_v, max_v $] of a feature and performs a linear transformation to the interval $ [0,1] $ if the value of $ v $ is in the desired range @priddy2005artificial [16].

A similar method is the statistical z-score normalization as shown in equation [eq:def:zscore]. It is based on the desired mean $ \mu $ and the desired standard deviation $ \sigma $. The advantage is a smaller impact of outliers on the values inside the standard deviation, but the resulting range is $ [-2, 2] $ @priddy2005artificial [15].

Another alternative is the softmax method, which is a simplification and combination of the z-score and the sigmoid functions as defined in equation [eq:def:softmax]. This leads to a linear shape in the standard deviation and a nonlinear shape towards the range limits for outliers @priddy2005artificial [16,17].

$$\begin{aligned}
	minmax(v)	& = \frac{v - min_v}{max_v - min_v} 		\label{eq:def:minmax}\\
	zscore(v)	& = \frac{v - \mu}{\sigma} 			\label{eq:def:zscore}\\
	softmax(v)	& = \frac{1}{1 + \frac{v - \mu}{\sigma}} 	\label{eq:def:softmax}\end{aligned}$$

<div class="thumbnail col-lg-8 pull-right">
	<img src="images/normalization.pdf" class=""/>
	<div class="caption">
	<h4>Normalization Functions</h4>
This figure demonstrates the differences between normalization methods.
Input is a linear signal from $ 0 $ to $ 100 $.
The desired input in the right figure is the same as the input in the left one with the difference that one value is set to $ 5000 $.
In this case, the regular values lose their significance if the minmax-method is used and they reduce their significance if the z-score-method is applied.
The softmax-method keeps a good co-domain, but distorts the linear shape.
	</div>
</div>

Alternatively to the weighted variables, derived commensurable variables could be determined and analyzed. Useful methods for this approach are *multidimensional scaling*, *correspondence analysis* or *factor analysis* @bacher2010clusteranalyse [176].

### Clustering Algorithms {#sec:cluster_algorithms}

The problem of cluster analysis is solvable in various ways. The used algorithm should be chosen depending on the properties and requirements of the application.

[p:challenges~o~f~c~luster~a~lgorithms]

There are certain challenges in this task, which are considered with different priorities by the available algorithms. The objects of a cluster should be homogeneous, that means objects of the same cluster should be as similar as possible. The clusters should be isolated, which means that objects of different clusters should be unlike and heterogeneous. The interpretability of clusters is another important challenge. Since the cluster analysis is used in most cases for investigation of data, the clusters should fit to an underlying model. The solution should be stable, which means a minor sensitivity to changes of the method or data. The number of clusters should be as small as possible under the condition of homogeneity and isolation. The last two attributes should improve the interpretability and the model representation of the solution @bacher2010clusteranalyse [18].

[p:taxonomy~o~f~c~luster~a~lgorithms] There is a taxonomy of clustering methods, which helps to chose the appropriate algorithm, because methods of the same class have similar properties, strengths and weaknesses. Geometric methods project the objects to a $p$-dimensional space, which could help the user in a manual classification. If the dimension of the space is higher than two or three this becomes very difficult and unsuitable. *Multidimensional scaling* is an example for this kind of methods.  Deterministic methods achieve a distinct classification. They are separated into hierarchic and partitioning methods. Deterministic hierarchical algorithms unite objects and clusters iteratively to a solution, whereas deterministic partitioning algorithms separate all objects into clusters. Probabilistic methods are model-based instead of an heuristic approach. They assign a probability or cohesiveness to each combination of object and cluster. Advantages of probabilistic methods are the possibility to consider noise or measurement errors, but drawbacks are the requirement of larger datasets @bacher2010clusteranalyse [18-19, 253-354].

[p:overlapping~c~lusters] Another classification of cluster analysis methods is based on the results, namely if the clusters are overlapping, non-overlapping or if every object have to be assigned to at least one cluster. This generally reduces the heterogeneity, but could decrease the number of clusters as well @bacher2010clusteranalyse [147].

[p:cluster~a~lgorithm~a~pplication]

The application of cluster analysis in this project will have to manage high-dimensional data, which is caused by the complexity of microscopic traffic models. Therefore geometric methods cannot be applied. Probabilistic algorithms are omitted in this work, because it is unclear if of the dataset is large enough to obtain meaningful results. Certain deterministic approaches satisfy the requirements of this application, so first an overview of principal algorithms is given before the chosen one is explained.

#### Fundamental Principles in Deterministic Cluster Analysis {#ssec:clustering_principals}

Deterministic cluster algorithms are in general based of one of four principles. These are the *nearest neighbor*, *average linkage*, *centroid* and *density based methods*. These principals have properties which allow sorting the algorithms by the chance to archive suitable results.

[p:nearest~n~eighbor~m~ethods]

The *nearest neighbor methods* deliver, with one exception, non-overlapping clusters. The requirements for the application of these methods are weak. The original data does not have to be present, but the similarity between every object pair, measured by an arbitrary method is necessary. In these methods, two objects are neighbors if the similarity exceeds a threshold. In this way, a neighborhood graph is built. The variants are distinguished in a way that the clusters are extracted from the graph. The complete linkage clustering unites all objects to clusters which belong to the same clique. In other words, if all objects are similar to all other objects of the same cluster. This condition implies high homogeneity, but increased number of non-isolated clusters as well. The $k$-nearest neighbor method adds an object under the condition that it will be connected to $k$ other objects of this cluster. The $1$-nearest neighbor method is also known as single linkage method, which results have a low homogeneity in most cases. Since these methods deliver results with weak homogeneity, other methods should be used if the original object data is available. The complete linkage method is one of few possible choices if an overlapping solution from a deterministic method is required @bacher2010clusteranalyse [148, 155].

[p:average~l~inkage~m~ethods]

The results of *average linkage methods* contain non-overlapping clusters. The requirement is that the dimensions have to be metric. The condition of building a cluster is that the average similarity of the objects of a cluster must exceed a threshold. The sensitivity to outliers and irrelevant data is therefore low @bacher2010clusteranalyse [148-151,168].

[p:centroid~c~lustering] *Centroid methods* use a representative point of each cluster, which is used in the decision if an object belongs to this cluster. Two general approaches are available. The representative could be an object or the average of the set, which leads to slightly different properties. Representative object methods select, as the name suggests, certain objects, which are each used as representative of a cluster $r(C)$. Other objects are assigned to clusters with a similar representative if the similarity exceeds a threshold $t(C)$.

$$\label{eq:representative_similarity}
	C = \{s | \delta(s, r(C)) \geq t(C), s \in D\}$$

As a result, solutions with overlapping clusters are possible. If the object is only assigned to the most similar representative, the solution is non-overlapping. Objects become representatives if their number of neighbors is maximal, if they are most similar to the mean of all objects of a cluster, and if they are un-similar to an existing representative. The procedure is about sorting the objects by their representativeness to their cluster. The cluster will be iteratively separated by the ordered representatives @bacher2010clusteranalyse [148,278].

[p:representative~c~enter~m~ethods]

In *representative center methods* the representative is the center of the cluster. The center is defined as the mean of all objects of this cluster @bacher2010clusteranalyse [150].

$$\begin{aligned}
	r(C) := & 				\bar{v}(C)\\
	\bar{v}(C, i_v) = & 	\sum_{i_{s,C} = 0}^{n_{s,C}}{
		\frac{v(i_{s,C}, i_v)}{n_{s,C}}
	}\label{eq:mean_of_cluster}\end{aligned}$$

Several variants of this method exist, namely the *median*, *ward* and *k-means* methods. All of them are non-overlapping methods which deliver a good heterogeneity between clusters. The *median* and *ward* methods maximize the distance between the cluster centers. The *k-means* method instead minimizes the variance of objects in a cluster. This method is particularly useful for large amount of data. The ward and the $k$-means method, are less sensitive to outliers and irrelevant variables @bacher2010clusteranalyse [18,150,154,168].

[p:density~b~ased~m~ethods] *Density based methods* unite objects to clusters if the number of objects in a defined distance exceeds a threshold. So they combine advantageous cluster shapes of nearest neighbor methods with good homogeneity of centroid methods at the cost of efficiency. Common density based algorithms are and .

[p:algorithm~s~election]

The outline of the available cluster analysis algorithms shows that *nearest neighbor methods* have low requirements, but the quality of the results are low as well, so they are not used in this work. The *ward method* is useful for the analysis of smaller datasets, because the computation of the similarity between the possible cluster unions is very costly. Tasks for large datasets should use the *k-means* method if the requirements are guaranteed. One requirement is the usage of the *squared euclidean distance* as similarity measure, which is no drawback in this case. Since in this application a hundreds of thousands of states are realistic, this method will be used @bacher2010clusteranalyse [191]. The second used algorithm will be the algorithm, because it has a good trade-off between quality and performance. Both selected algorithms are specified in the next sections.

#### K-Means Clustering {#ssec:k-means}

The *k-means algorithm* is a deterministic partitioning method which minimizes the sum of squares within all clusters (see eq. [eq:squared~e~uclidean~d~istance], [eq:within~c~luster~s~um~o~f~s~quares] and [eq:k-mean~m~inimization]).

$$\begin{aligned}
	\label{eq:k-mean_minimization}
	S_{w} = & 
	\sum_{i_C = 0}^{n_C}{
		\sum_{i_s = 0}^{n_{s,C}}{
			d^2(s(C,i_s), r(C_{i_C}))
		}
	} \rightarrow min\end{aligned}$$

This is the validation function of this method ($\beta := S_w$). In this way, the homogeneity within clusters and the heterogeneity between clusters is maximized. This *within-cluster sum of squares* is also known as *error variance*. The error variance converges with the number of iterations to a local minimum. In addition, the result becomes more stable with a growing number of objects. Since the relation between objects and clusters is based on the distance to the representative, the *k-means* method tends to build spherical clusters. An advantage is a low runtime[^3] in comparison to other nearly equally effective approaches @bacher2010clusteranalyse [301-308].

The first step of the procedure is the random placement of a chosen number of cluster representatives. The second step is the assignment of each classification object to the most similar cluster representative as shown in equation [eq:k-mean~a~ssignment]. If all objects are assigned to the nearest cluster, the representatives have to be recalculated as shown in equation [eq:mean~o~f~c~luster]. The last step is to check whether the object assignments have changed in the previous step. If this is the case, a new iteration has to be started. Otherwise the method is done.

$$\label{eq:k-mean_assignment}
	\vec{s} \in C \Leftrightarrow C(i_C) = \underset{i_C=0}{\overset{n_C}{min}} \; d^2(\vec{s}, r(C(i_C)))$$

The original $k$-means method requires a predefined number of clusters in the data. A method without this requirement starts with one cluster and increase this number iteratively, as long as the proportional reduction of the error (eq. [eq:error~v~ariance~i~mprovement]) is above a threshold. Another useful stopping criteria is a significant decrease in the error variance @bacher2010clusteranalyse [305-308].

$$\begin{aligned}
	S_a = & 
	\sum_{i_s}^{n_{s,S}}{
		\sum_{i_v = 0}^{n_v}{
			(
				s_{i_s,i_v} - \bar{v}_{S, i_v}
			)^2
		}
	}\\
	\label{eq:error_variance}
	\eta^{2}_{} = & 
	1 - \frac{S_w}{S_a}\\
	\label{eq:error_variance_improvement}
	\eta_p = & 
	1 - \frac{\eta^2_{n_C = k}}{\eta^2_{n_C = k - 1}}\end{aligned}$$

Since the $k$-means method is based on randomly initialized clusters, the procedure should be repeated, dependent on the number of variables $n_v$. The higher the dimensionality is, the more often the procedure should be repeated to improve the reliability. This method is known as replication analysis @steinley2011cho [288].

#### Density Based Spatial Clustering of Applications with Noise {#ssec:dbscan}

The is a deterministic hierarchical agglomerative method, which is able to discover clusters of arbitrary shape. In comparison to alternative algorithms with this property, the runtime is rather short on large datasets. In this method, objects are distinguished by the number of objects in their neighborhood $n_{s,N}$. Objects are in the same neighborhood if their similarity exceeds a chosen threshold $\delta(\vec{p}, \vec{q}) \geq t$. The similarity function in this method is arbitrary. There are *core-points* and *border-points* of a cluster. An object is a core-point, if the number of neighbors exceeds a chosen minimum $n_{min,N}$. Otherwise this object is a border-point of this cluster. Objects without neighbors are classified as noise @ester1996density.

The procedure starts by choosing an arbitrary object. If this is a core-point, the neighborhood of this object becomes a cluster. If two objects of different clusters are neighbors, these clusters have to be merged. If the chosen object has no neighbors it is noise and if its neighborhood density is below the threshold, another unchosen object has to be checked @ester1996density.

The quality of the result depends on the chosen threshold $t$ and neighborhood size $n_{min,N}$, which could be determined by a heuristic method. The heuristic depends on the observation, that the distance to the $k$-nearest neighbor used as the threshold, will lead to a neighborhood size of circa $k+1$. Thereby, the neighborhood size of a cluster is relatively stable. The ordered $k$-nearest neighbor distance of all objects will contain several peaks in its slope. The first major peak is a good choice as threshold. The neighborhood size should be chosen interactively @ester1996density.

### Validation and Interpretation {#p:classification_interpretation}

The interpretation of the situations is based on the state vector elements. The ranges and distributions of the values per state could be compared between the total dataset and the determined clusters. Similar distributions of variables mean a minor importance. A significant difference indicates a higher importance instead.

[p:classification~v~alidation~v~s~e~valuation] The validation of a result is not equal to the evaluation of the method, because used methods are randomized and use heuristics. So the application must be repeated with various methods or configurations. The evaluation, which is explained later in this work (see sec. [sec:model~a~nalysis~e~valuation]), is about testing a defined hypothesis with cluster analysis.

[p:reason~f~or~c~lassification~v~alidation] The cluster analysis validation checks whether the previously stated challenges to a good cluster analysis are solved. The result is formally valid, if it is stable and the model is valid, and the clusters are homogeneous and isolated. This should be determined by measurements and compared between different tests. Common measures were already explained in section [p:cluster~v~alidation~f~unctions] @bacher2010clusteranalyse [27-28].

[p:classification~v~alidation~a~pproach] The quality of the classification model is ensured by the usage of two different approaches. The results of these algorithms will be interpreted separately. Hypotheses which are explained by both solutions should be reliable.

[p:classification~s~tability~a~pproach] The stability of the classification and the derived insights determined by analyzing independent datasets collected from different subjects.

Methods and Materials {#chap:methods_materials}
=====================

The following methods aim at solving two subsequent problems. The first problem, as explained in section [sec:paramter~i~nference], is the approximation of the model parameters regarding a subject’s session in a 3D environment based traffic simulator. In other words: the projection of the model onto the recorded behavior. The required car simulator, with its scripted scenarios, is described in section [sec:simulation~e~nvironment]. The second problem is the detection of the model gaps and behavior deviations. The methods and tools to solve it are explained in section [sec:situation~c~lassification].

Simulation Environment {#sec:simulation_environment}
----------------------

<div class="thumbnail col-lg-8 pull-right">
	<img src="images/simulator_1.jpg" class="" label="img:simulator"/>
	<div class="caption">
	<h4>Simulator</h4>
	The simulator setup has a physical steering wheel, pedals and a panorama monitor configuration.
	It runs the Siegburg scene in a virtual environment.
	</div>
</div>

The simulation environment, which is used for the recording of reference data, is based on the Unity game engine. The scene contains a part of Siegburg with replicas of houses, roads and trees. It was mostly created in the FIVIS project. The semantic road network and other traffic participants, including models and the behavior, were created in the AVeSi project. The participants act according to the driver model, explained in section [sec:traffic~s~imulation].

The agent system was adapted for the use with human drivers in the following way: The driver has a representation as agent, so other agents will recognize him/her as leading and prioritized agent. The driver agent is registered in the segment registry that he/she is currently driving on. That segment is determined by a spatial query system. The yielding and communication with other agents is realized by refusing all yielding requests and not sending any. For input of the driver agent’s action, a force feedback steering wheel and a pedal device with clutch, brake and throttle is used. For the output a triple monitor setup was employed. The simulator is shown in figure [img:simulator].

The study participants as well as simulated traffic agents could be placed into defined scenarios. Per session, there was only one primary driver, which is called the *player*. To gain and reproduce the defined scenarios, certain methods of session conditioning are implemented, which are explained in section [sec:session~c~onditioning]. The scenarios and the motivation for considering them are topic of section [sec:scenarios].

A recording component was integrated into the simulator software. It creates an archive file for every driving session. This contains a complete representation of the semantic traffic network, geometry and performance attributes of all vehicles, configuration of the lane change model, weights of emotional events, parameters of the emotion regression and, as far as known, all personality parameters of the agents. For every simulation state, the instant of time and the state of every agent is stored. All information is stored in format, which allows to write hierarchic structures without much overhead. That is important for the real-time requirement of the simulator.

### Scenario Conditioning {#sec:session_conditioning}

A scenario is realized as a path in the environment, a set of agents and certain triggered events. The path is based on waypoints of the traffic network. The triggers have individual activation radii and are used to control the process of the scenario. Some are activated by the player and the other by one specific or a set of agents. A trigger at the start waypoint can only be activated by the player. It forces a recording component to start a new session and spawns the scenario agents. If the player is not human, the emotional state will be reset. A trigger at the last waypoint stops the recording, so a session is one drive through a defined scenario. Further classes of triggers move agents to other positions, hold them to generate gaps or switch their behavior from parking to driving.

To make the player-agent follow the desired path, the navigation module is overridden with the scenario’s path and restored afterwards. For human players, at transitions between road segments, blue arrows provide guidance through the scenario.

The activation and deactivation of agents is done by an additional component. It saves their initial state, including position, orientation, etc. and resets it after they are out of the player’s field of view.

### Scenarios {#sec:scenarios}

The player’s tour through the virtual environment is designed to contain a set of scenarios, which are explained in the following. The transitions between this scenarios are implemented as scenarios as well, but these transition scenarios do not contain scripted events or other traffic participants. This allows to concatenate the sessions per subject and to evaluate the emotional gradient over a longer period of time.

#### Crossroads

<div class="thumbnail col-lg-8 pull-right">
	<img src="images/crossroads.png" class="" label="img:crossroads"/>
	<div class="caption">
	<h4>Crossroads</h4>
		This image shows the bird's eye view of the \emph{Crossroads} scenario.
		The blue arrows show the player's path.
		The yellow objects are other vehicles, which approach the crossroads. They will arrive simultaneously with the player.
		The shaded section is part of the road-network but not important for the scenario.
	</div>
</div>

The first scenario contains an unregulated crossroads, which means that it does not have any traffic lights or specific priorities. The player approaches from the west, while on each other incoming road another agent is waiting as shown in figure [img:crossroads]. 100 meters before the crossroads, the other waiting agents start driving with the players velocity, so that all vehicles will arrive synchronously. As a result, every vehicle hat so wait on another vehicle; creating a deadlock situation. Further a house doesn’t allow a clear view to the road on the right. However, this circumstance is not considered in the model so far.

The driver has to decelerate and check the situation. The options are trivial: Someone has to pass on its right of way. The driver could wait until one of the other agents passes on its right of way or he/she could be the one, who yields to the agent on his/her left.

In the agent model, the decision depends on the personality and mood state. As explained in section [sec:turning~a~nd~p~riorities], this dead-lock is solved by a kind of politeness voting, which means that the driver with the highest politeness yields to the driver on his/her left.

#### Turn Left

<div class="thumbnail col-lg-8 pull-right">
	<img src="images/turn_left.png" class="" label="img:turn~l~eft"/>
	<div class="caption">
	<h4>Turn Left</h4>
		This image shows the bird's eye view of the \emph{Turn Left} scenario.
		The blue arrows show the player's path.
		The yellow objects are vehicles on the turn lane, which the player has to change to.
	</div>
</div>

In the next scenario, the player has to turn left on the next junction. There are six slowly driving vehicles ahead on the turn lane. The regular lane is empty and there are some gaps between the vehicles as shown in figure [img:turn~l~eft]. On the crossroads in front are no other drivers.

The drivers options are to brake and enqueue as last vehicle on the turn lane or to keep the current velocity, overtake some vehicles and to use a gap to change lanes. The third option is to overtake agents but don’t decide to use a gap, approach the junction and wait for the other vehicles to pass and change the lane then.

The current agent implementation is not able to solve this problem adequately. At the decision of the next segment, which depends on the distance to the junction, the agent recognizes a mandatory lane change. The lane change is executed if it is deemed feasible, but the agent is unable to evaluate different gaps and choose the best.

#### Obstacle

<div class="thumbnail col-lg-8 pull-right">
	<img src="images/obstacle.png" class="" label="img:obstacle"/>
	<div class="caption">
	<h4>Obstacle</h4>
		This image shows the bird's eye view of the \emph{Obstacle} scenario.
		The blue arrows show the player's path.
		The yellow object is a stopped delivery truck with warning lights.
		The red objects are vehicles on the opposing lane, which drive continuously past the player and the delivery truck.
	</div>
</div>

A delivery truck blocks the lane and indicates via warning lights that it is parking. As displayed in figure [img:obstacle], the opposing lane is full of vehicles. A position triggered event moves the opposing vehicles from the end of the road to the beginning to realize a constant flow of vehicles. Additionally, another position triggered event inhibits the movement of the agents to generate deterministic time gaps of different lengths.

The generated gaps have a pseudo random length. The agents are held for $5s$, $1s$, $1s$, $5s$, $3s$, $2s$ and then starting with the first gap again. The effective gaps at the obstacle can all be used to overtake the obstacle, because the opposing agents will brake to prevent a collision.

The set of options in this scenario is more complex. Besides the basic decisions of performing a lane change to the opposing lane, the usage of the sidewalk or the usage of the reverse gear followed by an alternative route to the destination are possible. Some variables define options as well. The different times until the decision and the periods of the gaps permanently require new decisions.

As explained in section [sec:traffic~s~imulation], the agents evaluate the current gaps continuously. One criteria is the advantage on the lane change based on the politeness. Another is the safety of the usage of the current gap.

#### Constriction

<div class="thumbnail col-lg-8 pull-right">
	<img src="images/narrow_place.png" class="" label="img:narrow_place"/>
	<div class="caption">
	<h4>Constriction</h4>
		This image shows the bird's eye view of the \emph{Constriction} scenario.
		The blue arrows show the player's path.
		The narrowing is in fact a bulge of the sidewalk on both sides with trees.
		The red object is an opposing vehicle, which will arrive at the obstacle when the player does.
	</div>
</div>

In this scenario, the road is narrowed on both sides, which results in a traffic situation without prioritized lanes. As visualized in figure [img:narrow~p~lace], the player approaches from the east, while another vehicle waits western from the constriction. When the player enters the road, the agent accelerates such that they will meet at the constriction.

Both drivers could wait before the obstacle, accelerate to pass it before the other driver arrives or try to pass simultaneously, which is possible but dangerous.

The agent model solves this situation as lane change. If it evaluates the lane change as not feasible while approaching the obstacle, it will send yield requests to the opposing agent. In this special case, both agents receive and send a yield request. It is guaranteed that only one agent will yield by the condition that an agent will never disclaim its gained priority if another agent yields to it.

#### Reference

The reference scenario consists of all transition paths between the aforementioned scenarios. The motivation for this reference was to gather data from a scenario without significant events.

The route length in that scenario is approximately $\frac{3}{4}$ of the total distance. There were no other traffic participants during that scenario, which was not told to the participants. Lane changes caused by stationary obstacles were necessary as well as turns at junctions.

Parameter Inference Implementation {#sec:paramter_inference}
----------------------------------

To infer personality profiles from the driving measurements a software component was developed which is based on evolution strategies as explained in section [sec:optimization].

Special requirements for the implementation follow from the chosen method. The profile approximation needs to evaluate a large number of hypothetic personality profiles by simulation. To minimize the total necessary runtime, a more efficient implementation of the simulation, than that for the virtual environment, was developed (see section [sec:ocl~i~mplementation]). For that, a representation of the current scenario must be exportable from the virtual environment. The applied method is explained in section [sec:data~t~ransfer].

### Efficient Simulation Implementation {#sec:ocl_implementation}

The efficient simulation implementation uses capabilities to be able to simulate many sessions in parallel. To minimize the dependency on specific hardware, the framework was chosen. To simplify the data import and analysis, the software was developed in Python using the *PyOpenCl*[^4] library.

The framework distinguishes thread private, thread global as well as read-only, write-only and read-write memory areas, which are organized in buffers. The implementation uses global read-only memory for the scenario descriptions and the simulation states. Thread local, write-only buffers are used for the simulated actions. That allows to simulate certain profiles in the same session as well as one profile in different sessions without copying data between host and accelerator during an inference process.

### Data Validation and Transfer {#sec:data_transfer}

<span>c|c</span>

[b]<span>0.45</span> [img:semantic~m~odel]

&

[b]<span>0.45</span> [img:memory~r~epresentation]

[img:data~s~tructure]

The existing data structures are not easily convertible into vectors or matrices, which would be easy to transfer between devices and efficient accessible for several reasons. The traffic network, as described in section [p:traffic~n~etwork~d~efinition], consists of segments of different types (lanes and connectors) with specific attributes. In most cases they are used as generic segments. Therefore, it is advantageous to store them in a shared structure. Further, the number of waypoints per segment as well as the size of a priority chart of a junction are variable. The size of the priority chart depends on the number of connectors on the related junction. The simulation state consists of a number of agent states, which are session specific.

The self developed Python package[^5] delivers the solution for this issue. It allows to define arbitrary structures, which are located in a coherent memory space, and only uses primitive data types. As shown in figure [img:data~s~tructure], elements of lists in various sizes are stored in global host arrays. The local lists contain only references to the first and last element and are implemented as array lists inside an array of all elements of that type. Further it allows to generate C/ C code to de-serialize and access these data structures. So the data can be parsed, validated and enhanced by versatile Python code and accessed by efficient C code.

While the recorded data is parsed and the binary data structure is built, some information are supplemented. For example, the agent model requires for each state the next segment for navigation and priority evaluation purposes. These values are backtracked from future states. Further, constant data is precomputed. For example the distances of waypoints to sequent waypoints and to the segment end.

### Evolution Strategy Implementation {#sec:profile_approximator}

The minimization of the behavior deviation, based on evolution strategies, is implemented using the *inspyred*[^6] software library. It requires a population generation and an evaluation method, which computes the fitness of a solution. Further parameters are the population size, the maximum number of generations and the value ranges of the problem dimension. The population is initialized with uniformly distributed random numbers. However, as explained in section [sec:optimization], the population size and generation count must be set interactively. Hence, this is discussed in chapter [chap:evaluation].

Optimization problem definitions were implemented for the -profile and certain parameters. That allows to infer arbitrary agent parameters without significant code modifications.

The decision, which cost function to use is not obvious. A naïve approach would be the application of the between the reaction of the modeled behavior $b_m$ and the measured reaction $b_D$, to a set of recorded system states $D$, as defined in equation [eq:cost~f~unction].

$$\begin{aligned}
\label{eq:cost_function}
	c_{i_a, D}(p(i_a)) =\;&
	\sum_{s}^{s \in D}\frac{(b_D(i_a, s) - b_m(i_a, s))^2}{n_D}\end{aligned}$$

This is not the only applied method, because an expected drawback of the mean squared error application is that all kinds of deviations will effect the result without considering known details. Since the general problem is the search of a personality profile, the cost functions should consider the effect of the personality profile on the driving behavior. That effect is controlled by the time dependent politeness factor. That again, is used to weight the driver’s advantage and the other agent’s disadvantage caused by a decision. The effect of such a decision is mostly a change of the driving behavior primitive. For example, changing from approaching, following or staying behind an obstacle to accelerating and overtaking it. These changes effect the acceleration fundamentally. To consider that fact, the cost function could compare the sign of the acceleration and average it over the session (see equation [eq:sign~c~ost~f~unction]). This function is called ; it ignores some deviations, which are not induced by the personality.

$$\begin{aligned}
\label{eq:sign_cost_function}
	c'_{i_a, D}(p(i_a), s) =\;&\begin{cases}
	  1,  & \text{if }sign(b_D(i_a, s)) = sign(b_m(i_a, s))\\
	  0, & \text{else}
	\end{cases}
	\\
	c_{i_a, D}(p(i_a)) =\;&
	\sum_{s}^{s \in D}\frac{c'_{i_a, D}(p(i_a), s)}{n_D}\end{aligned}$$

However, there are cases where this function has drawbacks. For example, if a non-stationary obstacle, with a velocity below the desired, is ahead. A divergent decision would not change the acceleration sign, but the mean value. An error threshold or a squared error could indicate the correctness of a profile, but then the drawback is that divergent desired velocities would distort the result, because it is currently not implemented as personality dependent value.

A further problem is (in both approaches) that the inference of different profiles varies in complexity, because optimal (expected) profiles lead to different behavior of the cost function. A high politeness causes a high influence of the other agent’s advantage, which leads to high waiting times behind an obstacle. If in such a session, a profile with a low politeness is evaluated, the agent would more often decide to accelerate and the error would be high. However, if the expected politeness is minimal and a very impolite agent profile is evaluated, there would be only a few states, where the simulated agent accelerates and the reference agent decelerates. Then the obstacle is passed and both profiles behave similarly and the error value is low.

If certain profiles get a good score, the most polite agent is probably the optimal. Hence, not the single individual of the final population with the best fitness should be chosen. Instead the final population should be evaluated by the equality of their behavior.

Situation Detection and Classification Approach {#sec:situation_classification}
-----------------------------------------------

To reduce the deviation between the agent and the human behavior, situations have to be detected and defined, in which deviations occur. A definition of such a situation allows to extend the driver model, for example, with an additional driving strategy or an extension of the low level methods. Since the high amount of driving data, this detection should be automated or supported.

There are certain methods to detect and classify these situations. The first is to execute a cluster analysis on the difference between agent and human action combined with the state and to filter the resulting clusters by the degree of behavior deviation. The alternative approach is to filter the states by the action error and to cluster the remaining states. The second method was chosen, because the number of features is smaller and therefore less error-prone. Further, an unconsidered situation could require a sequence of various actions, as in the lane change for example. A cluster analysis could separate these actions.

The next challenge is to choose the set of features to cluster. As explained in section [sec:cluster~a~nalysis], the higher the dimensionality, the harder the interpretation of the results becomes. On the other hand, the clusters become meaningless if there are not enough features to interpret. The agent memory and simulation state is the foundation of these features. These variables have various types and attributes.

1.  If the agent is stationary.

2.  In which driving strategy or primitive the agent acts, or on which waypoint and segment it drives.

3.  The emotional level, idle time, orientation, position, velocity and acceleration of the agents, as well as relative values among each others.

Agent relations require an order. The order in the used driver model is based on agent sequence on a road segment as well as neighborship of segments. Reasonable related agents are the leading agent as well as the next agent on the neighbor lanes. That implies that these variables are not continuously defined. Similarity measures used for the cluster analysis do not allow undefined values. Therefore, the variables have to be set to values in these cases, but they are not in the expected range or at least would not cause changes in the behavior. Default values, out of range, could influence the normalization.

The chosen parameters are the driver’s velocity, the current idle time, the distances to his leading agent and to the agent on the left hand road segment. If the distances are undefined, the values are set to $-10m$. This is reasonable because this value lies within the expected range of a few hundred meters before and behind the agent, but the value is negative, so it is mostly out of sight and collision course. These dimensions should be able to represent most traffic situations and are low enough to be interpretable.

Besides the used features, the used error thresholds are crucial for the classification. A high threshold would cause the refusal of data, which contain relevant information. Too low thresholds could cause the consideration of irrelevant details and insignificant deviations. The approach is to use the deviation in simple reference sessions as foundation of these thresholds. The requirement of the related scenarios are that no unpredictable situations occur for the driver, which could cause heavy steering or braking. Further, the path should be clear to reduce the deviation to the road reference line. These are fulfilled by the sub-scenario *Reference from West*, which is a part of the reference scenario. It connects the crossroads and the left turn scenario with a long straight road with two junctions, but no other traffic participants.

The states are initially classified, by the subject individual thresholds, into deviant and similar states. These results are concatenated per scenario. The motivation for this is to detect model gaps instead of deviations per subject. The determination of the cluster count in k-means will be done manually by inspecting whether clusters contain similar states and to terminate if that is the case.

The last task is the comparison of the detected clusters between the considered scenarios. This comparison is done based on occurrences of these deviations. A deviation occurrence is defined as a start-state-index and an end-state-index. Occurrences with a duration below $2s$ will be ignored and occurrences of the same situation, disconnected for few seconds will be merged to reduce the total amount of occurrences. There should be not more than $5$ clusters per scenario; a total amount of $50$ or less. The comparison of the observations is a manual task, because of the manageable amount clusters and the high level of analysis.

The implementation is based on the library *scikit-learn*[^7] and the interactive interface is built using *IPython*[^8] and *Matplotlib*[^9].

Evaluation {#chap:evaluation}
==========

This chapter contains the evaluation strategies, execution and results for the approaches developed in this work. Section [sec:eval1] contains the evaluation of the parameter inference and section [sec:model~a~nalysis~e~valuation] contains the results within a discussion of the parameter inferred from the data from human test subjects. In the last section [sect:eval2], the evaluation of the model analysis and the analysis of the data from human sessions are described.

Profile Approximation Evaluation {#sec:eval1}
--------------------------------

It is to investigate whether evolution strategies are sufficient to approximate personality profiles by analyzing simulated behavior in relation to reference data.

All these evaluations require a general simulation configuration, which is explained in section [sec:simulation~c~onfiguration]. The first evaluation aims at investigating the quality and limitations of the implemented cost functions, which is topic of section [sec:cost~f~unction~e~valuation]. Further, the inference method and implementation was evaluated. The required data was gathered by simulating $10$ agents with uniformly distributed personality profiles within the virtual environment and recording their behavior. In this way, datasets for each profile and scenario were generated and processed by the developed software. The next step was the investigation of population sizes and the convergence behavior (see section [sec:eval1:convergence]) of the inference process. The last task was the analysis of the value distribution in the final population (see section [sec:eval1:distribution]) to determine the methods precision.

### Simulation Configuration {#sec:simulation_configuration}

[img:eval:emo~f~fm~c~oeffs]

As explained in section [sec:personality~p~rofile], the personality values depend on the ranges of the underlying study. The experiments described here are based on the work of @Krueger2013 where the results of the study from @herzber09 were used. Thus the range per trait is $[-1:1]$. The identified clusters are irrelevant in this evaluation because the profile inference should not be dependent on the distribution of profiles in reality.

The politeness depends on the emotion influenced personality vector and a correlation vector. The level of the positive and negative emotions are changed by emotional events, which are weighted by the product of the current personality and a specific correlation vector. These coefficients are listed in table [img:eval:emo~f~fm~c~oeffs].

The values indicate that the extraversion can be inferred by the states and the consequences of positive emotions, the neuroticism by negative emotions. The agreeableness is the major factor of the politeness. The changes of politeness and the state of positive emotions should allow to infer the conscientiousness. Currently the openness trait is not used, which is why it is not considered in the following evaluations.

It is expected that positive emotions appear less frequent because only yielding events of other agents cause them and these are not continuous. Further it is expected that these yields often lead to free-flow behavior, which causes no more emotions in the next period and the emotion regression will reset the emotional level. So the inferred values of the extraversion are anticipated to be less accurate than the values of the other traits.

### Evaluation of Cost Functions {#sec:cost_function_evaluation}

[img:eval0:max~p~oliteness~f~itness~p~er~p~rofile]

As explained in section [sec:profile~a~pproximator], the used cost function is crucial for the quality of the results. Therefore, it was evaluated what the considered cost functions are able to distinguish.

The approach was to simulate agents with maximal and minimal possible politeness and record their behavior. Then the resulting sessions were evaluated with certain extreme -profiles; extreme in terms of the minimum and maximum values per trait. The test was repeated with both cost functions, and .

The result (see table [img:eval0:max~p~oliteness~f~itness~p~er~p~rofile]) was that different profiles could behave exactly the same. The different cost functions distinguished the same profiles by their behavior. The number of behavior variants correlates with the number of large gaps.

Since the equal expressiveness of the tested cost functions in further evaluations the -functions is used. The application of the -function would lead to the same results.

In the scenario, gaps of different sizes are generated. These are $1s$, $2s$, $3s$ and $5s$ whereof the gaps of $1s$ were not used in this test. Session 1 contains 5 gaps above $1s$ long which is exactly the number of different cost values from the different profiles in that session. Session 2 contains 7 gaps above $1s$ long which is more than the 4 different cost values from the different profiles in that session. This means that probably other untested profiles would resolve in other behavior.

### Optimization Convergence {#sec:eval1:convergence}

![Population Size and Convergence](images/evaluation_1/inference_convergence_0.pdf "fig:") [img:eval:agent~d~river~p~rofiles]

The evolution process can be configured with certain parameters. As explained in section [p:fundamentals~o~f~e~volution~s~trategies], those are the population size, the mutation standard deviation $\sigma$ and the number of generations. Further the methods for selecting, variating and recombining individuals can be varied.

The first test was performed with the most simple options, but variations in the population size, to investigate the quality of the fitness function implementation. The population size is limited by the available computing resources and runtime considerations.

The tested population sizes were in the range from $10$ to $10,000$. $\sigma$ was set to $1 \times 10^5$ without change over time, which resulted in small changes, high precision and slow convergence. Every individual was selected for reproduction, to which the mutations were added. The next population was set to the best half of the united previous population and the mutated set. The applied cost function was the *mean acceleration sign equality error*.

This test was repeated with all $10$ agent configurations and resulted in similar behavior. The result is shown in table [img:eval:agent~d~river~p~rofiles]. The first observation is that the best solutions were generated for the initial population, even if it was very small. The median, average and worst individuals are equal to the best solution after one to two generations. This could be caused by local minima, which the process is unable to overcome, but this is implausible, because even populations sizes of $10,000$ result in solutions with the same fitness. That means that the total set of possible behavior characteristics in that determined sessions is obviously small and hence easy to find.

The second result is the inference runtime per population size. All processes were executed for $10$ generations, which is more than necessary. The evaluation of $10$ individuals per generation took $3s$, $100$ took $6s$, a populations size of $1,000$ finished after $51s$. Finally $10,000$ evaluations per generation, which lead to $100,000$ simulations in total, terminated after $30.6min$.

### Profile Distribution {#sec:eval1:distribution}

[img:eval:sse:agent~d~river~p~rofiles]

[img:eval:sse:agent~d~river~p~rofiles~c~rossroads]

As shown in the previous section, there are sets of profiles, which generate the same behavior in terminated sessions. If the objective is to get the optimal model configuration in relation to recorded behavior, the concrete values may be irrelevant for classification of model gaps.

The question is, which minimum and maximum values per personality trait could occur in profiles that show optimal behavior. The chosen method to investigate this question, was to evaluate a large set of equally distributed random profiles, without evolving them. The final population was sorted by their fitness and filtered by reaching the best fitness.

This evaluation was executed for the and (see table [img:eval:sse:agent~d~river~p~rofiles]) cost-functions. Both functions deliver similar results, which supports the conclusion from the previous evaluations, that there is a limited set of behavior principals.

In sessions in the *Obstacle* scenario, the extraversion, neuroticism and conscientiousness could not be set to limits. Whereas the agreeableness could be limited like “must be smaller than x” or “must be greater than y”. Since the other traits influence the behavior as well, the variation of their values, decreases the precision of the solution. For example, a profile with high agreeableness and neuroticism could lead, in a certain instant of time, to a politeness value which is equal to a profile with low agreeableness and neuroticism. However, the determined profile ranges contain the reference profile in all results. In sessions of scenario *Crossroads*, no -profiles could be distinguished by their behavior (see table [img:eval:sse:agent~d~river~p~rofiles~c~rossroads]). The cause is that this scenario contain only one personality based decision: the deadlock-resolution. If one agent decides to accelerate, which happens in only one state, the deadlock is no more. Obviously one of the other three agents did this decision in the recorded sessions.

The results of these sessions clarify that the current application of the personality profile inference is not suitable for personality determination of humans.

Inferred Profiles from Human Drivers {#sec:model_analysis_evaluation}
------------------------------------

The following evaluations are based on data which was recorded from $10$ subjects. The approximated profile ranges and reference thresholds are listed in appended table [img:eval2:determined~t~hresholds]. The ranges were determined by evaluating $10,000$ uniformly random profiles.

The first result is that the smallest limits were determined for the agreeableness-trait. This was already observed during the inference evaluation (see explanation in section [sec:eval1:distribution]). The usage of these limits besides the simulation and its configuration should be interpreted based on the unproven specific mapping between personality, emotion and driving behavior.

Further, there are non-maximal trait-ranges in the results of some subjects other than the agreeableness. These observations correlate with a low ratio of optimal profiles to total profile count. In these cases, below one thousand profiles resulted in best fitting behavior. The reliability of the ranges in these cases may be improved by increasing the number of test profiles.

Further the number of profiles, resulted in best fitting behavior, correlate with the action thresholds. If the thresholds are low few fitting profiles were found. These thresholds are required for the behavior comparison which is topic of the next section and have the meaning of the maximal deviation in the reference scenario. However, they are unused in the inference and the correlation may be accident.

No accident are presumably the circumstance that the ratios of best fitting profiles from human sessions are in general significantly lesser than these of agent sessions. For investigating the cause of this, the gap acceptance of the human drivers were evaluated and the result is that in average the $7th$ gap was used, the minimum was $5$ and the maximum $10$. For the cost function evaluation in section [sec:cost~f~unction~e~valuation], the most polite agent accepted the $7th$ gap. Therefore the current implemented model must be incorrect.

Model Analysis Evaluation {#sect:eval2}
-------------------------

The model analysis required canceling certain artifacts in the recorded data. The kind of artifacts and the cancellation method are described in section [sec:deviation~a~rtifact~c~ancellation]. As described in section [sec:situation~c~lassification] the behavior deviation between agent and human were compared by the deviation occurrences in similar situations. The evaluation approach is as follows. The driving sessions are manually searched for session sections containing behavior deviation. These deviations are classified to certain behavior patterns, which are topic of section [sec:behavior~p~atterns]. The results of the cluster analysis of the sessions as well as the mapping of the results to the behavior patterns are explained in section [sec:situation~c~lassifications].

### Artifact Cancellation {#sec:deviation_artifact_cancellation}

How strong the deviation of model behavior is, was determined by the results of the reference scenarios. In these, no situation exists, which shows unusual high deviation. So, the maximum error serves as the threshold for further tests, which determine if a situation is adequately modeled. As visible in appended figure [img:eval2:raw:reference~s~teering~d~eviation], the maximum steering error reaches the limit of the value range. This phenomenon occurs in all simulated sessions. The peaks correlate while changing from the current waypoint to the next. Human drivers, other than agents, will not exactly follow the reference line between waypoints. Since the state, including the position, is based on human drivers, the next waypoint will not be in front of the agent, but nearly orthogonal. That could explain these peaks. As explained in section [sec:high~l~evel~b~ehavior], there is a parameter, which controls the inertia of the steering. This explains the fast but not instant regression after the local extremum.

Since this phenomenon is caused by the measurement method, it should be filtered out as well as possible. Also visible in appended figure [img:eval2:raw:reference~s~teering~d~eviation], these peaks were identified by the clustering, so a naïve approach is to select the clusters without the peaks and choose the threshold from them. But the drawback is, that the overall clustering result is biased by that issue. The second and chosen approach is to detect these states by the current distance to the next waypoint and to ignore and interpolate the steering action for them. The result of that correction is shown in appended figure [img:eval2:corrected:reference~s~teering~d~eviation].

As visible in appended figure [img:eval2:raw:reference~a~cceleration~d~eviation], there are reference sessions, where the maximum acceleration error does not serve as threshold. This phenomenon is explained by an incorrect desired velocity in the simulated -profile. The desired velocity $\dot{x}_d(i_a)$ is the sum of the speed limit of the current road segment and an individual velocity offset parameter. If this parameter is inferred, similar to the -profile, the reference deviation decreases significantly, as shown in appended figure [img:eval2:corrected:reference~a~cceleration~d~eviation]. Further, there are single states where the agent decelerated as much as possible. To prevent a disproportionate impact of these states, the acceleration error was smoothed by a Gaussian filter, which reduces the max error in that example from around $10$ to $1$ $m/s^2$. The cause of that peak is unclear. The maximum action deviations in the corrected sessions, which are used for further evaluations, are listed in appended table [img:eval2:determined~t~hresholds].

### Behavior Patterns {#sec:behavior_patterns}

For the last evaluation the recorded driving sessions were manually analyzed. The question is which behavior patterns are observable in sessions of different subjects, which of them are reproducible by the currently implemented driver model in general and finally whether the automatic analysis method is able to identify them as well. The identified patterns are enumerated and discussed in the following. The occurrences per session are listed in appended table [tab:eval2:behavior~p~attern~o~bservations].

1.  All recorded driving sessions in scenario *Reference from East* contain two continuous deceleration events in the user data, whereas the agents accelerate. These events can be assigned to situations with a roundabout or a sharp bend ahead.

2.  All recorded driving sessions in scenario *Reference from North* contain minor steering actions with varying intensities by the subjects. The steering angles are below $5^{\circ}$ whereas the agents generate very strong steering actions. This phenomenon is explainable with the steering action artifacts explained in section [sec:deviation~a~rtifact~c~ancellation] but as shown in appended figure [fig:behavior~d~eviation~i~llustration~1~], agents steer during lane changes with up to $20^{\circ}$. A further possible cause is that humans decide earlier to leave their lane and change back later, over a longer distance, if there are no other vehicles around.

3.  Two subjects in the *Crossroads* scenario passed the crossroad without stopping or waiting to solve the deadlock-situation. The agent instead acts with heavy braking instead.

4.  One recorded driving session in scenario *Crossroads* contains a behavior pattern of approaching the crossroads, waiting for a few seconds and crossing it slowly. The agent instead accelerates much faster.

5.  Most of the recorded sessions of subjects in scenario *Constriction* contain a behavior of changing the steering angle in a linear way. The situations in which this behavior occurred are the exit of a bend. The agent’s steering model allows only an immediate alignment of the steering to the desired position with an defined inertia factor.

6.  In two of the recorded sessions in scenario *Constriction*, the subjects wait in front of the narrowing but accelerates slowly before the opposing vehicle passes. The agent brakes and waits in that situation.

7.  In some of the recorded sessions in scenario *Constriction*, the subjects accelerate when the opposing vehicle appears and decelerate again after the narrowing is passed. The agents decide to brake and wait.

8.  Four of ten subjects decelerated $150$ - $200m$ before the obstacle, accelerated again and finally approached the obstacle in scenario *Obstacle*. The agents accelerate continuously in that situation instead. This deviation could be caused by the desire to increase the available time for evaluating the situation before reaching the obstacle.

9.  In four of the recorded sessions in scenario *Obstacle* the subjects approach the obstacle. The difference to the agent behavior is that the deceleration is not exponential to the distance. The velocity is changed in several steps with sharp transitions.

10. In some of the recorded sessions in scenario *Obstacle* the subjects accelerate if a larger gap is ahead, but cancel the lane change and wait again. The agents are unable to act like this.

11. A further behavior pattern is observable in three sessions in the *Obstacle* scenario. The human driver accelerated slowly when unusable gaps are at the obstacle but a larger gap is ahead. That means that human drivers are able to evaluate multiple gaps per lane, whereas the agents only evaluate the gaps which are currently next to its position.

12. One subject in scenario *Obstacle* turned the steering wheel a few seconds before the acceleration and actual lane change. The agents do not prepare for any planned actions.

13. The last described behavior pattern is observable in all recorded sessions in scenario *Turn Left*. The driver decelerates, changes to the turning lane and follows the queue, whereas the agent behavior is to keep the desired velocity, overtake all vehicles and change to the turning lane in short distance to the junction.

[tab:eval2:desired~v~elocity]

[p:velocity~o~ffset~o~bservation]

Further, an observation was made in the context of behavior pattern *RE1*. The observation was that the velocity varied between these deceleration events. Since no other vehicles or obstacles are part of that scenario the velocity should converge against the driver’s desired velocity. Since no speed limit signs or user interface elements announced any speed limit, the human drivers have to choose the velocity freely. The maximum velocities per driver and section are listed in table [tab:eval2:desired~v~elocity]. The velocities per sections are similar but with some features. The different mean values between the road sections could be explained by different lengths, initial velocites and lane widths. For example *Road 2* and *Road 3* have similar length, but the width of *Road 3* is smaller. The deviations between the values within the sections for the sharp *Bend* and the narrow *Road 3* could indicate driver specific risk propensities.

### Situation Classification Evaluation {#sec:situation_classifications}

[tab:eval2:mapping]

The occurrences of behavior deviations clustered by the *k-means* method are listed in appended table [tab:eval2:situation~c~lassifications]. The obvious observation is that the number of occurrences is significantly higher than the result of the manual analysis. This is caused by an lack of generalization.

Further, the number of clusters is not equal to the number of manually classified behavior patterns. For example, in *Reference From North* (*rn*) two instead of one clusters were detected. In sessions in the *Crossroads* scenario (*c*) only one cluster, which means no separation, was detected. This is plausible because the observed behavior patterns *C1* and *C2* occurred in the same situations, but in sessions of different subjects. Three behavior patterns were observed in sessions of the *Constriction* scenario whereas the evaluated method delivered two clusters. The behavior patterns *N2* and *N3* occurred both immediately in front of the constriction, thus the situation clustering was unable to separate them. Another observation is that, especially in the sessions recorded in the *Obstacle* scenario, the classification continuously alternates between *o1*, *o4* and *05* in almost all sessions. This could be caused by overlapping behavior patterns or by exaggerated separation.

The automatically detected occurrences were mapped to the manually classified one. The quality is measured by the number of false positive and false negative classifications and their ratio to the number of occurrences in the reference classification. The mapping was done by maximizing the true positive classifications.

For detecting model gaps it is more important to minimize the false negatives instead of the false positives, because false positives are more easily ignored than false negatives are considered.

This mapping and the quality measurement results are shown in table [tab:eval2:mapping]. The result is that there is a high amount of false positives with up to ten times more false positives than the total amount of positives. Additionally three of the behavior patterns (*C2*, *O2* and *T1*) were not detected by the application. However, in most cases the ratio of true positives is higher than the ratio of false negatives and in most cases at least one occurrence of the behavior pattern was detected. Therefore, this method enables the automatic review of a large amount of recorded behavior and helps analyzing it.

### Analysis of Explored Scenarios

A conducted method of evaluating the automatic detection of model gaps was the analysis of already explored scenarios. From @Krueger2013, unrealistic waiting times in scenario *Obstacle* are known, for agents without a emotions model, which causes a static politeness. It is also known from @Krueger2013, that in the *Constriction* scenario, agents with a high politeness value, have to wait unusual long if there are many opposing vehicles in queue. Since the results from the evaluation of the cost functions (see section [sec:cost~f~unction~e~valuation]) revealed, that the method is only able to detect behavior deviations in a determined session. An theoretically infinite idle time in a pseudo dead lock situation will never appear in a recorded session, therefore it is impossible to detect.

Conclusions {#chap:conclusions}
===========

The objective of this work was the investigation of significant deviations in behavior between human and artificial drivers. This task implied two major challenges. First, the comparison required finding a model configuration that best fits to a recorded dataset of human behavior. Second, the large amount of data resulting from such a comparison needed to be reduced to be manageable for analysis. The general result is that human drivers apply several behavior patterns to several traffic situations based on their personality whereas current artificial drivers only decide on gaps and yieldings based on their personality. The situations in which these behavior patterns occur are detectable by cluster analysis.

From these major challenges a set of questions emerged, which were answered in this work. The first question was, what the concepts of the driver model are and in which way it considers individual behavior. The next question was, how the parameters of an artificial driver can be found which best represents a human driver. It was proposed to answer these questions by simulating hypothetic profiles, comparing their actions with human behavior and optimizing solutions with evolutionary strategies. This approach was implemented and evaluated with the result that it is possible to infer the model parameters to a level where the simulated behavior does not change. A further question was how to reduce the data resulting from the comparison of several human drivers with their artificial copy. An approach was developed to reduce similar simulation states with deviating actions to several traffic situations using cluster analysis. The representation of the detected clusters, based on occurrences in recorded sessions, visualized including the simulated actions enable to investigate the behavior deviations and patterns.

To efficiently investigate individual driving behavior, the drivers had to be brought into scenarios in which no traffic rules exist or rules are often ignored. Tools and methods had to be developed to control the driving sessions and the behavior of other traffic participants to ensure the comparability of different sessions. An additional hurdle for the application and evaluation of the developed approach was a potentially high amount of required simulations to be executed, which was accomplished by implementing the driver model based on methods.

Several aspects of the parameter inference and its implementation were evaluated. First, it was examined how individual personality changes actions in simulated driving sessions and which functions are able to detect and quantify these differences. The result was that several personality profiles show equal behavior in determined driving sessions. The number of different profile sets depends on the number of discrete decisions. Therefore continuous decisions like the acceptance of speed limits or safety margins should be inferable with more accuracy. However, it was shown that the best fitting profile can be found by the implemented approach. Further, the convergence behavior and runtime issues of the implementation were evaluated to investigate the applicability for more complex relations between personality and actions. This evaluation revealed a voluminous reserve for further investigations, which will be explained later in this chapter. The next question was how accurate the personality profile inference is. The ambivalent answer is that for some traits limits can be inferred, but the range depends on the data. The result becomes more precise, the more personality depended decisions the data contain. More data with a more detailed model would most likely improve the results. The profiles with best fitting behavior were inferred for artificial and human drivers, though it was revealed that the current driver model or its configuration for determining gap acceptance produces incorrect waiting times when personality profiles are dynamic.

For the model analysis two major questions were answered. First, how human and artificial driving behavior can be compared with a manageable level of detail and second, which deviations are currently present. Therefore, a method was evaluated and applied which detects traffic situations with behavior deviation. The deviations in these sessions require manual analysis. The application of the model analysis showed, that in some situations several behavior patterns arise, whose occurrences per driver are likely personality depended.

[sec:future~w~ork]

From these results and conclusions follow certain proposals for extensions of the current traffic agent implementation and proposals for further investigations.

Currently, the different layers of the agent behavior and components to solve problems like pseudo-deadlocks are strictly separated. There are the primitives *free-flow*, *following*, *approaching* and *staying*, the lane changing options *staying on the current lane*, *changing to the right lane* and *changing to the left lane* with the special case *changing to the lane in opposing direction* and there are the deadlock solving primitives *accommodating* and *act against the other’s will*. The low-level -primitives are static. The lane changing and deadlock solving components have dynamic aspects and are implemented as high-level driving strategies, which decide which -primitive to use. The observed behavior patterns (see [sec:behavior~p~atterns]) show that there is more than one variant of each low level behavior. For example, the driver can approach an obstacle with continuous deceleration, incremental deceleration or by heavy deceleration followed by slowly approaching with constant velocity. The driver can overtake an obstacle, pass a crossroads or a constriction with one quick action, in some tries or many shades in between. The choice is not mandatory, it is personality and context dependent. To respect this, the agent implementation should be changed to contain a set of behavior patterns which are defined as specific configurations of the low-level behavior, accelerating and steering included. The choice of the applied behavior pattern should be implemented similar to the current lane-changing. This is done by evaluating the options under considerations of feasibility, necessity and advantage of the affected drivers. This approach is suitable for evaluating behavior patterns as well. Further, specialized driving strategies for crossroads or lane changes are no longer required because the related situations are also manageable in this way. The decision should also be made based on the risk and legality of the action in addition to the advantage and feasibility.

In section [p:velocity~o~ffset~o~bservation] the observation was described that the driver’s desired velocity decision must be more complex than adding an individual offset to the currently legal speed limit. It may depend on the sharpness of the turn, the width of the lane or on the advantage of reaching a determined position earlier. Hence, the driver model should be extended by a velocity model. This approach can, but does not have to, be integrated with the previously explained approach of adding behavior patterns.

Besides the extension of the current driver model, the -profile inference could be improved by adding or changing scenarios, since a result is that the precision of the inference depends on them. The more personality dependent decisions a scenario contains, the more precise the result becomes. The currently implemented personality dependent situations are pseudo-deadlocks and possible lane changes. Therefore, significantly more decisions are to be made in the lane change evaluation, so more sessions in the *Obstacle* scenario are necessary. Since the current implementation of this scenario generates only pseudo-random gaps, the decision should be similar in each session. Therefore, the gaps have to vary between the sessions of the same subject or have to be completely random.

By canceling artifacts and deviations from the reference data, the drivers desired velocities were inferred using the same method as used for the personality inference. This way, the behavior could be fitted very precisely in some reference sessions. While the personality currently impacts some discrete behavior transitions, the impact of -parameters, like the desired velocity, buffer distances and many more, are visible in all or at least a sequence of states. Hence, a further project should infer individual -profiles from drivers and correlate them with their -profile.

Two proposals for future projects require more investment but are worth mentioning. Since the general approach of comparing natural and artificial driving behavior produced some evidence of driver behavior patterns, this approach could be applied to driver communication. The virtual environment has to be extended to manage multiple human drivers simultaneously. The communication devices are distance lights, the signal horn and gestures. The major investments in this application would be the multiuser networking implementation, which is supported by the used Unity game-engine. Further, a motion capturing sensor has to be integrated with a representation in the virtual environment to enable the driver to gesture. The second proposal is the evaluation of personality recognition by driving in virtual environments. However, this requires a significant deeper integration of the -model into the driver model and evidence for the correctness of the implemented dependencies between behavior and personality. Further, a larger set of scenarios and situations of personality dependent behavior in the virtual environment is also required.

In review of the work it becomes evident that the comparison of human and artificial behavior based on virtual environments helps to improve and evaluate models of human behavior. The pure amount of proposals for future investigations illustrates the opportunities this approach contains. It justifies the continuation of the presented work.

Illustration of Personality-Induced Behavior Deviation
======================================================

![Behavior Deviation from Correct Profile - 1](images/evaluation_0/most_impolite_agent/siegburg_scene__obstacle_from_south__2014_04_11_15_25_21_-1_0_1.pdf "fig:") [fig:behavior~d~eviation~i~llustration~3~]

![Behavior Deviation from Wrong Profile - 1](images/evaluation_0/most_impolite_agent/siegburg_scene__obstacle_from_south__2014_04_11_15_25_21_1_0_1.pdf "fig:") [fig:behavior~d~eviation~i~llustration~4~]

![Behavior Deviation from Correct Profile - 2](images/evaluation_0/most_polite_agent/siegburg_scene__obstacle_from_south__2014_03_23_16_01_20_1_1_-1.pdf "fig:") [fig:behavior~d~eviation~i~llustration~1~]

![Behavior Deviation from Wrong Profile - 2](images/evaluation_0/most_polite_agent/siegburg_scene__obstacle_from_south__2014_03_23_16_01_20_0_0_0.pdf "fig:") [fig:behavior~d~eviation~i~llustration~2~]

Parameters and Thresholds from Human Subjects
=============================================

[img:eval2:determined~t~hresholds]

Illustrations of Reference Behavior
===================================

![Raw Reference Behavior Deviation - 1](images/evaluation_2/raw/siegburg_scene__reference_from_west__i_2014_01_23_13_11_20.pdf "fig:") [img:eval2:raw:reference~s~teering~d~eviation]

![Corrected Reference Behavior Deviation - 1](images/evaluation_2/corrected/siegburg_scene__reference_from_west__i_2014_01_23_13_11_20.pdf "fig:") [img:eval2:corrected:reference~s~teering~d~eviation]

![Raw Reference Behavior Deviation - 2](images/evaluation_2/raw/siegburg_scene__reference_from_west__a_2014_01_22_10_20_51.pdf "fig:") [img:eval2:raw:reference~a~cceleration~d~eviation]

![Corrected Reference Behavior Deviation - 2](images/evaluation_2/corrected/siegburg_scene__reference_from_west__a_2014_01_22_10_20_51.pdf "fig:") [img:eval2:corrected:reference~a~cceleration~d~eviation]

Occurrences of Behavior Patterns and Traffic Situations
=======================================================

[tab:eval2:behavior~p~attern~o~bservations]

[tab:eval2:situation~c~lassifications]

[^1]: <http://vc.h-brs.de/avesi>

[^2]: <http://vc.h-brs.de/fivis>

[^3]: Benchmark at <http://scikit-learn.org/stable/modules/clustering.html>

[^4]: <http://mathema.tician.de/software/pyopencl>

[^5]: <https://github.com/abbgrade/blob_types>

[^6]: <http://inspyred.github.io>

[^7]: <http://scikit-learn.org>

[^8]: <http://ipython.org>

[^9]: <http://matplotlib.org/>
