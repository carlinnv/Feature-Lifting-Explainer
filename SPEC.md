# Featre Lifting Explainer - Implementation Specification

## 1. Project Overview
This will be an interactice, scroll-based explainer with "Try it yourself" sections to encourage user engagement. The primary goal of this project is to make feature learning an accessible topic for those with limited technical knowledge in machine learning or advanced mathematics.  


## 2. Core Learning Objectives

1. Understand where a linear classifier falls short. 
2. Understand how using x_1 and x_2 to "construct new features" allows us to classify more complex data. 
3. Understand that feature lifting does not make a non-linear classifier. Specifically, the classifier is still linear, just in a higher dimension. 

## 3. Tools Used
I have listed a number of tools in the `README.md` under "Credit". These are tools that a completely [separate and unrelated matrix explorable](https://yizhe-ang.github.io/matrix-explorable/) by Yizhe Ang used in their explorable.

Before implementing any changes, determine if these tools are appropriate for this project. If any changes need to be made (e.g. adding a new tool that might be more suitable for the animations in this explainer), edit the README accordingly. It is not necessary to add this decision to `DEVLOG.md`.


## 4. The Initial Version 

The scroll-based explainer leads the user through multiple sections, each following a similar format. Every section will have a visual on the left side and some sort of descriptive text on the right side.   

### 4.1 Straight Line Cluster Split

The explainer starts out with a leftside view of a 2D dataset. The two axes are features x_1, x_2, and points from two different classes (red and blue) are plotted on it. In the original dataset, the blue points are clustered around the origin, while the red points form a circle around ithe blue ones. 

On the right side will be text prompting the user to drag a straight line that can split the two classes. Below the text will be the accuracy score of the split, which, no matter what the line is, will not be a sufficient result. 

### 4.2 Feature Lifting Introduction

The next section introduces feature lifting as a potential solution to the problem illustrated in 4.1. An animation brings the 2D graph from 4.1 to a 3D plot, by raising each point to its height Z. The value of Z will be a new feature: x^2 + y^2. 

This 3D plot should be an interactive scene that users can rotate. The point of this exercise is to demonstrate that the plot forms a sort of bowl shape with blue points at the bottom of the bowl and red ones at the sides. 

### 4.3 Sliding a Plane in the 3D Graph

Now that we are in the 3D space, we allow the user to slide a plane up and down and give them the same challenge as in 4.1: to separate the red and blue classes. This section should show the same "accuracy display" as in 4.1, and as the user slides it toward the division point, it should show 100%.  

### 4.4 Collapse Back Into 2D

Now, show two copies of the 3D graph side-by-side. The right 3D graph will then collapse back into 2D to demonstrate how we can use our 3D solution on our 2D data. The curve where the plane cuts the bowl will light up and collapse into dashed lines in the 2D graph. 

Here, the user will realize that it collapses into a circle. New controls should appear on the right side and allow the user to move the plane up and down and "tilt" it, showing the resulting effects in the 2D view.


### 4.5 New Features
The last section will be a fully interactive challenge, where the user gets to play with a new dataset and see what adding new features will do in both 2D and 3D views. I will intentionally use data that cannot be classified with the same Z as earlier. 


### Potential Areas of Confusion

These areas of the explainer have been marked for potential confusion/improvement: 

1. It might be confusing to users why we are allowed to just construct new features out of the original ones given. 

2. It might be challenging to create an intuitive understanding that "linearity" describes the classifier relative to the features rather than the original data. How can we make it make sense that despite the fit being linear in the constructed features, it arrives nonlinear at the original features? 

When you start building out the features related to these noted areas of confusion, ask me how we should proceed before moving on. 