@extends('layouts.site')

@section('title', 'About Us')
@section('description', "At Body Wizard, we embrace the fact that medicine is both a science and an art, using lab work to inform our practice of Chinese medicine and track progress.")
@section('path', "https://bodywizardmedicine.com/about")

@section('content')
        <div class='splash btnPopDown top' id='palosanto'>
            <h1 class='purple shaded30 paddedXSmall'>About Us</h1>
            <div class='button small pink booknow'>book an appointment</div>
        </div>
        
        <div class='central large'>
            <h2 class='yellow paddedSmall'>Science, Medicine, Art</h2>
            <p>At Body Wizard, we embrace the fact that medicine is both a science and an art.</p><p>To objectively measure and track patients' progress, we use at-home testing kits for a wide variety health markers. This health information informs our practice of Chinese medicine.</p><p>Combining science with the art of diagnosis and holistic treatment is a fusion that empowers both practitioner and patient in a common goal towards complete health.</p>
        </div>
        
        <div class='split60 central large paddedBig'>
            <div>
                <div class='splash' id='headshot'></div>
                <div>
                    <h3 class='left paddedSmall'>David Taylor, MSOM LAc</h3>
                    <p class='left'>A lifelong interest in biology brought David to the field of medicine. Always fascinated by life, how it works, and how it can heal itself, he studied biology, psychology, and neuroscience.</p>
                    <p class='left'>While he loves science to this day, the focus of modern medicine is treating illness on the extreme end of the spectrum and, for treatment, relies exclusively on drugs.</p>
                    <p class='left'>David wanted to work with natural medicines, and he wanted to help people truly heal, not just cover up their illness with drugs.</p>
                </div>
            </div>
            <div class='paddedSides leftOnly left'>
                <div class='divide hor yellowBG'></div>
                <h3 class='paddedSmall'>Education + Training</h3>
                <h5>Chinese Medicine (Masters)</h5>
                <p class='little'>Acupuncture, herbs, meditation, qigong<br><span class='italic'>AOMA Graduate School of Integrative Medicine, 2013</span></p>
                <h5>Psychology (Bachelors)</h5>
                <p class='little'>Neuroscience, hormone regulation, and how the brain sculpts our experience<br><span class='italic'>University of Masschusetts, 2008</span></p>
                <h5>Biochemistry (Bachelors)</h5>
                <p class='little'>The chemistry that is at the foundation of human metabolism<br><span class='italic'>University of Masschusetts, 2008</span></p>
                <div class='divide hor yellowBG'></div>
            </div>
        </div>
@endsection