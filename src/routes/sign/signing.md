# PDF Signing

This feature is supposed to enable users to sign PDFs digitally instead of having to print, sign, and scan them.

To this end the following basic functions need to be implemented:

- [ ] reading and rendering PDF Files
- [ ] placing an image (the signature) at multiple places in the PDF
- [ ] rendering out the resulting PDF as a download or in-place edit
- [ ] someone acquire the user's signature in a way that can be copied

## Nice to have future features

These features would be cool and nice to have in the near-ish future for more comfort:

- saving the acquired signature(s) for later use, so the user does not have to re-upload them
- Allowing to put mutiple different signatures on the same doc, either to look more organic or to allow adding signatures by different people
- Acquiring signatures through the smartphone/tablet for finger/pen signature input
- Automatically filtering backgrounds from provided signature images like the apple PDF app
- Directly adding the signature through either smartphone or webcam photo
- Allow users some customizability as to how their signature gets filtered (black and white, etc.)
- Save the signed PDFs locally in the application for later reference
- Automatically upload signed PDFs at the click of a button to sharepoint or some other entity like that
- Enalbe users to fill out PDF-Forms directly in the app as well and/or add textboxes to manually fill (in case it is not a properly created PDF Form)
- For PDFs requiring multiple signatures, enable users to request "permission" from others to put in their signature
- Notifications for certain signature related actions

## Technical notes on extracting signatures

There are multiple techniques out there, but most seem to rely on OpenCV to do most of the image processing.

This might also be a simple, yet interesting link:
https://answers.opencv.org/question/220762/extract-handwriting-and-print-from-background/

Just using certain color layers for the thresholding might make sense, since they will be disproportionally used.

It might also make sense to take a couple of test images and then throw them into Affinity to actually check the histograms and distributions. Might save a lot of guesswork...
