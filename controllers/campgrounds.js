const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.newCampground = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    newCampground.images = req.files.map(file => ({ url: file.path, filename: file.filename })); // parens for implicit returns ({})
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Campground Created Successfully.');
    res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
    // find the campground by id and populate all the reviews for that campground
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        // then populate the authors for each review
        populate: { 
            path: 'author'
        }
    }).populate('author'); // then populate the author for the campground itself
    if(!campground){
        req.flash('error', 'Campground Not Found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // check the campground exists
    if(!campground){
        req.flash('error', 'Campground Not Found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // spread the campground object to the campground schema
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const images = req.files.map(file => ({ url: file.path, filename: file.filename }))
    campground.images.push(...images); // spread new images onto existing images array
    await campground.save();
    req.flash('success', 'Successfully Updated Campground.');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted Successfully.');
    res.redirect('/campgrounds');
}