module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            /*fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },*/
        },
    },
    plugins: [
        require('daisyui'),
    ],
    daisyui: {
        themes: [
            'cyberpunk',
            /*{
                mytheme: {},
            },*/
        ]
    },
}
