@extends('layouts.site')

@push('metadata')
    <title>About Us | Body Wizard</title>
    <meta name='description'
        content="We practice medicine as both a science and an art. Using labwork to inform our practice and track progress, we diagnose and treat according to the art of Chinese medicine.">
    <meta property='og:url' content="https://bodywizardmedicine.com/about">
    <meta property='og:title' content="About Us | Body Wizard">
    <meta property='og:description'
        content="We practice medicine as both a science and an art. Using labwork to inform our practice and track progress, we diagnose and treat according to the art of Chinese medicine.">
@endpush

@section('content')
    <div class='splash btnPopDown top' id='palosanto'>
        <h1 class='purple p-y-mini shaded30'>About Us</h1>
        <div class='button small pink booknow'>book an appointment</div>
    </div>

    <div class='central fit-content'>
        <h2 class='yellow p-y-xsmall'>Science, Medicine, Art</h2>
        <p>At Body Wizard, we embrace the fact that medicine is both a science and an art.</p>
        <p>To objectively measure and track patients' progress, we use at-home testing kits for a wide variety health
            markers. This health information informs our practice of Chinese medicine.</p>
        <p>Combining science with the art of diagnosis and holistic treatment is a fusion that empowers both practitioner
            and patient in a common goal towards complete health.</p>
    </div>

    <div class='split60 central fit-content p-y-medium'>
        <div>
            <div class='splash' id='headshot'></div>
            <div>
                <h3 class='left p-y-xsmall'>David Taylor, MSOM LAc</h3>
                <p class='left'>A lifelong interest in biology brought David to the field of medicine. Always fascinated by
                    life, how it works, and how it can heal itself, he studied biology, psychology, and neuroscience.</p>
                <p class='left'>While he loves science to this day, the focus of modern medicine is treating illness on the
                    extreme end of the spectrum and, for treatment, relies exclusively on drugs.</p>
                <p class='left'>David wanted to work with natural medicines, and he wanted to help people truly heal, not
                    just cover up their illness with drugs.</p>
            </div>
        </div>
        <div class='paddedSides leftOnly left'>
            <div class='divider yellow'></div>
            <h3 class='p-y-xsmall'>Education + Training</h3>
            <h5>Chinese Medicine (Masters)</h5>
            <p class='little'>Acupuncture, herbs, meditation, qigong<br><span class='italic'>AOMA Graduate School of
                    Integrative Medicine, 2013</span></p>
            <h5>Psychology (Bachelors)</h5>
            <p class='little'>Neuroscience, hormone regulation, and how the brain sculpts our experience<br><span
                    class='italic'>University of Masschusetts, 2008</span></p>
            <h5>Biochemistry (Bachelors)</h5>
            <p class='little'>The chemistry that is at the foundation of human metabolism<br><span class='italic'>University
                    of Masschusetts, 2008</span></p>
            <div class='divider yellow'></div>
        </div>
    </div>
@endsection
