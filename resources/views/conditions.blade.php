@extends('layouts.site')

@push('metadata')
<title>Realms of Healing | Body Wizard</title>
<meta name='description' content="Appointments are categorized as Evaluation + Diagnosis, Acupuncture, Botanical Medicine, Fascial Release, and Guided Meditation + Breathing">
<meta property='og:url' content="https://bodywizardmedicine.com/treatments">
<meta property='og:title' content="Realms of Healing | Body Wizard">
<meta property='og:description' content="Appointments are categorized as Evaluation + Diagnosis, Acupuncture, Botanical Medicine, Fascial Release, and Guided Meditation + Breathing">
@endpush

@section('content')
        <div class='splash btnPopDown top' id='pulse-1'>
            <h1 class='paddedXSmall shaded30 purple'>Commonly Treated Conditions</h1>
            <div class='button booknow small pink'>book an appointment</div>
        </div>
        <h2 class='yellow paddedSmall'>Three Realms of Healing</h2>
        <div class='menuBar website' id='ConditionMenu' data-populated='no' data-target='window' data-mode='scroll'>
            <div class='tab' id='internal'><div class='title'>Internal Medicine</div></div>
            <div class='tab' id='pain'><div class='title'>Muscle, Joint + Nerve Pain</div></div>
            <div class='tab' id='psychosocial'><div class='title'>Psychosocial</div></div>
        </div>
        <div id='Conditions' class='central large left listings'>
            <div id='InternalMedicineListing'>
                <div class='splash'>
                    <div class='icon stomach pink'></div>
                    <h3 class='white'>Internal Medicine</h3>
                </div>
                <h4>A typical treatment plan for internal medicine includes regular acupuncture sessions and relies heavily on botanical medicine.</h4>
                <h4>Examples: fatigue + low energy, irregular + painful periods, belly pain + digestive issues, cardiovascular health, infertility, generalized inflammation, allergies, infections</h4>
                <p>Encompassing the chest and the belly, this broad category covers all the internal organs. Liver, Kidney, Heart, Lungs, Pancreas, Stomach, Intestines, Gallbladder, Reproductive System… these are all the organs that we can address with our treatments.</p><p>We start with a complete medical intake that covers all of the organs, and we will prescribe specific lab tests that will help us further diagnose exactly what is going on. We can use the same lab tests periodically to track progress.</p><p>Depending on the duration and complexity of symptoms, these types of issues can be stubborn and difficult to treat. However, the biggest strength of Chinese medicine is its ability to uncover the root causes of disease.</p><p>Picture a giant tree standing alone in a field. You could describe each branch and leaf in full detail and, while it could be fully accurate, it is never going to be a complete description. The root system of the tree, a full half of the picture, is underground.</p><p>The same is true of any disease or illness. The symptoms that are most apparent are just the branches of a tree. In order to treat that illness completely, we have to address the roots that have caused those symptoms in the first place.</p>
            </div>
            <div id='MuscleJointPainListing'>
                <div class='splash'>
                    <div class='icon knee pink'></div>
                    <h3 class='white'>Muscle + Joint Pain</h3>
                </div>
                <h4>A typical treatment plan for muscle and joint pain includes regular acupuncture and fascial release</h4>
                <h4>Examples: old injuries that act up, stiffness + tightness, chronic pain, muscle strains, minor sprains, arthritis, low back pain, sciatic pain, tendonitis, frozen shoulder, decreased range of motion</h4>
                <p>Muscles and joints take the brunt of our daily activities and they hardly ever get the love and attention they deserve.</p><p>After an injury, our bodies often inhibit a muscle to protect that muscle or the joint it attaches to. The nerves that flex that muscle purposely make the muscle weaker! While the body does this to protect us, sometimes the inhibition lasts well after the injury has healed.</p><p>Let’s say a particular joint has 4 muscles that pull on it. If one of them is inhibited, then the others are pulling much more and that can cause uneven stress on the joint. This can be what’s causing your pain!</p><p>We will perform routine physical assessments to figure out which muscles are involved, and if necessary we will reactivate those muscles to correct imbalances.</p><p>Most mild to moderate aches and pains can be cleared up rather quickly. The longer you have been in pain and the more intense the pain is, the more treatments you will need.</p>
            </div>
            <div id='PsychoSocialListing'>
                <div class='splash'>
                    <div class='icon brain pink'></div>
                    <h3 class='white'>Psychosocial Conditions</h3>
                </div>
                <h4>A typical treatment plan for psychosocial conditions includes regular acupuncture and guided meditation + breathing</h4>
                <h4>Examples: anxiety, sadness, non-stop mental chatter, habits you can’t shake, lack of motivation + purpose, feeling stuck, feeling hopeless</h4>
                <p>Imagine a giant cliff with a river running through it.  The longer that river flows, the more likely it can carve out an unimaginable canyon. Now imagine trying to climb out of that deep canyon without the proper tools. Even for a very capable human, it might be difficult or even impossible!</p><p>Now imagine that our minds are the cliff and our actions are the river. Our actions and habits will carve out their own canyons in our mind. The longer we act a certain way, the more entrenched that activity gets and the harder it is to change.</p><p>We approach these psychosocial conditions with a multi-pronged approach to get you out of that canyon. Initially, we use acupuncture to calm the mind and reset the nervous system, activating the innermost part of the brain that integrates thoughts and emotions.</p><p>This acupuncture-induced state of mind fosters a type of non-judgmental awareness that is a common goal of many transformative practices. It can allow the mind to connect the dots and see life situations from new perspectives.</p><p>We can also integrate simple guided reflections, breathing exercises, and meditations that will further ease the process of reshaping our minds.</p>
            </div>
        </div>
        <div id='TreatmentDesc' class='small paddedXBig yellow10BG'>
            <div class='wrapper'>
                <div class='icon acu pink'></div>
                <div class='divide hor yellowBG central xs'></div>
                <h4 class='paddedSmall'>Acupuncture</h4>
            </div>
            <div class='wrapper'>
                <div class='icon botanical pink'></div>
                <div class='divide hor yellowBG central xs'></div>
                <h4 class='paddedSmall'>Botanicals</h4>
            </div>
            <div class='wrapper'>
                <div class='icon fascial pink'></div>
                <div class='divide hor yellowBG central xs'></div>
                <h4 class='paddedSmall'>Fascial Release</h4>
            </div>
            <div class='wrapper'>
                <div class='icon meditation pink'></div>
                <div class='divide hor yellowBG central xs'></div>
                <h4 class='paddedSmall'>Guided Meditation</h4>
            </div>
            <br>
            <div class='button fullWidth small pink marginBig bottomOnly link' data-target='/treatments'>more about treatments</div>
        </div>
@endsection