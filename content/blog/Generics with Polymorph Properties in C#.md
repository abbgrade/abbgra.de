tags: [programming, c#, design patterns]
type: blog-post
category: blog
datetime: 2014-09-26 00:00:00
title: Generics with Polymorph Properties in C#
summary: How to handle polymorphism in generic types without casting. With a working example in C# and UML illustration.
---

Sometimes you have an super class and a few child classes. For example an *Animal* class and special types of animals. Further you have another class with that super class as property. For example a *Compound* class. You may want to access the super class methods as well as the derived class methods.

Thats the moment when you implement *Compound* as generic class and limit the generic type to the *Animal* class, in the example. The class structure is shown in the next figure.

![Class Structure](/generics-with-polymorph-properties-in-c/class_structure.svg)

## C# Implementation Example

For the dirty details have a look at the following C# implementation.

### Animal Classes

The animals are as simple as possible. An abstract super class requires the implementation of the *Pet* method. The *Crocodile* is derived from *Animal* and has a *Feed* method that gets a *Gazelle* as parameter.

    public abstract class Animal
    {
        public abstract void Pet();
    }

    public class Gazelle : Animal
    {
        public override void Pet()
        {
            // jump around 
        }
    }

    public class Crocodile : Animal
    {
        public override void Pet()
        {
            // eat the hand 
        }

        public void Feed(Gazelle meat)
        {
            // eat the gazelle 
        }
    }

### Compound Classes

The implementation of *Compound* contains a piece of magic. It requires the implementation of a protected accessor of the *Animal* instance and contains a public accessor of that *Animal* instance.

    public abstract class Compound
    {
        protected abstract Animal baseAnimal { get; }

        public Animal animal { get { return baseAnimal; } }
    }

The generic *Compound* class contains a public accessor of the derived *Animal* class and stores the instance. That accessor shadows the accessor of the super class so the return type of the accessor method depends of access method. If you access *animal* from the derived class you get a derived *AnimalType*, for example *Crocodile*. If you access *animal* from the base class you get an *Animal*. 

    public abstract class Compound<AnimalType> : Compound
        where AnimalType : Animal
    {
        protected override Animal baseAnimal { get { return animal; } }

        public new AnimalType animal { get; private set; }

        public Compound(AnimalType animal)
        {
            this.animal = animal;
        }
    }

The next classes are not neccessary but they illustrate the advantages of the presented implementation method. In that derived classes you can access *animal* and don't need to cast it to derived *Animal* class.

    public class GazelleCompound : Compound<Gazelle>
    {
        public GazelleCompound(Gazelle gazelle)
            : base(gazelle)
        {
        }
    }

    public class CrocodileCompound : Compound<Crocodile>
    {
        public CrocodileCompound(Crocodile crocodile)
            : base(crocodile)
        {
        }
    }

### Usage Example

The *Zoo* class creates a few instances derived from *Compound* and stores them in a list of compounds.

    public class Zoo
    {
        public static void Main()
        {
            var crocodileCompound = new CrocodileCompound(new Crocodile());
            var gazelleCompound = new GazelleCompound(new Gazelle());
            var compounds = new List<Compound>() {
                crocodileCompound, 
                gazelleCompound 
            };

The base class methods are available.

            foreach (var show in compounds)
            {
                show.animal.Pet();
            }

The methods of the special classes are available without casting, which means that compiler is able to validate the implementation and in runtime no suprises will appear.

            crocodileCompound.animal.Feed(gazelleCompound.animal);
        }
    }