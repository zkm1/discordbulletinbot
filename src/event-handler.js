/*
    This file holds functions for how the bot responds to each command.
    Some of these example commands can be removed as we progress.
*/
const { MessageActionRow, MessageSelectMenu, MessageEmbed, User } = require('discord.js');
/*

*/
const { Users, Posts, Subscriptions, Tags, PostTags } = require('./dbObjects.js');

// Add the user to the database.
function command_register(interaction){
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    let response =`Hello ${userTag}, seems like something went wrong, try again!`;

    // code for adding user to the database.
    Users.create({userId: userIdVar, userName: userTag});
    response = `Hello ${userTag}, your profile has been created successfully.\nYou can use the profile command to add/remove tags.`;
    interaction.reply({content: response, ephemeral: true});

    /*
    const promise = new Promise((resolve, reject) =>{ 
        let userTemp = Users.findByPk(userID);
        if(userTemp === null){
            Users.create({userId: userID, userName: userTag});
            resolve(`Hello ${userTag}, your profile has been created successfully.\nYou can use the profile command to add/remove tags.`);
        } else{
            resolve(`Hello ${userTag}, your profile has been already registered!`);
        }
    });
    //
    promise.then((message) => {
        interaction.reply({content: message, ephemeral: true});
    }).catch((message) => {
        console.log(message);
    });
    */
    /*
    const [user , created] = Users.findOrCreate({
        where: {userId: userIdVar},
        defaults:{
            userId: userIdVar,
        }
    });
    */
}

// Remove the user from the database.
function command_unregister(interaction){
    let userTag = interaction.user.tag;
    let userID = interaction.user.id;
    
    let response = `Hello ${userTag}, are you sure you wish to delete your profile?`;
    interaction.reply({content: response, ephemeral: true});
    
    // add reactions to the message so the user can respond.
    // code for following up on the user's reaction.
    
    // code for nuking the user from the database.
    
}

// Responds with user profile.
function command_profile(client_obj, interaction){
    displayMenu(client_obj,interaction, 'Here\'s a list of what you subscibed.',['1','2','3']);
}

async function command_subscribe(client_obj, interaction) {
    const getAllTagsFromDB = ['1','2','3','4','5'];
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    let response =`Hello ${userTag}, seems like something went wrong, try again!`;

    // code for adding user to the database.
    // const tag = await Tags.create({tagName: "sfxsszffj"});
    // console.log('whats the id: '+tag.id);

    //create fake demo tags if you database havent been set up
    let demoTagsArr = ['cse101','cse130','cse140'];
    // Check if there are already tags in the database
    Tags.findAndCountAll()
    .then((result)=> {
        if(result.count === 0){
            console.log(result);
            for(const [i, name] of demoTagsArr.entries()){
                // Temporarily add tags to database
                Tags.create({id: i, tagName: name});
                console.log('Tag created!')
            }
        }
    })
    .catch(console.error);
    
    const tags = await Tags.findAll();
    console.log(tags);
    // response = `Hello ${userTag}, your profile has been created successfully.\nYou can use the profile command to add/remove tags.`;
    // interaction.reply({content: response, ephemeral: true});
    displayMenu(client_obj, interaction, "Select tags that you want to subscribe!", tags);
    let componentId = `select${interaction.id}`;
    client_obj.on('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // console.log(ddinteraction.user, ddinteraction.id, ddinteraction.component, componentId);
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {
            //console.log("Only the interaction component id associated with the msg's component id passes through!!")                                      
            await ddinteraction.deferUpdate()                                     
            .catch(console.error);

            //Delete message components                                    
            await ddinteraction.editReply({content: 'you selected tagID: '+ ddinteraction.values, embeds: [], components: []})
            .then((message) => ddinteraction.values)
            .catch(console.error);
            if(ddinteraction.values){
                //ddintereation.values == arr of tagID the user selected
                console.log('add id: '+userIdVar );
                ddinteraction.values.map(id=>Subscriptions.create({userId: userIdVar, tagId: id}));
                // Subscriptions.create({userId: userIdVar, tagId: 8});
            }
        }
    })
}

function command_unsubscribe(client_obj, interaction) {
    const getSubTagsFromDB = ['1','2','3'];
    displayMenu(client_obj, interaction, "Select tags you want to unsubscribe!", getSubTagsFromDB);
    //Append a unique slash command interaction id to the component custom id
    let componentId = `select${interaction.id}`;
    client_obj.on('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // console.log(ddinteraction.user, ddinteraction.id, ddinteraction.component, componentId);
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {
            //console.log("Only the interaction component id associated with the msg's component id passes through!!")                                      
            await ddinteraction.deferUpdate()                                     
            .catch(console.error);

            //Delete message components                                    
            await ddinteraction.editReply({content: 'you selected '+ ddinteraction.values, embeds: [], components: []})
            .then((message) => ddinteraction.values)
            .catch(console.error);


            if(ddinteraction.values){
                //ddintereaction.values is the array of selected tags
            }
        }
    })
    
}

function displayMenu(client_obj, interaction, description, arrayToDisplay) {
    const tagEmbed = new MessageEmbed()
    .setColor('#0099ff') 
    .setTitle('Tags')
    .setAuthor(interaction.user.tag + "'s User Profile")
    .setDescription(description)
    .setTimestamp();

    
    //TODO: will import a list of tagas from database
    //just a demo tags list for now
    // let demoTagsArr = ['cse101','cse130','cse140'];
    //tagsTOJSON() returns a list of options objects, we can just .addOptions(tagsToJSON())later
    function arrayToJSON() {
        let optionsJSONArray = []
        arrayToDisplay.map((eachTag)=> {
            optionsJSONArray.push({label: eachTag.tagName.toString(), value: eachTag.id.toString()})
        })
        return optionsJSONArray;
    }
    //Append a unique slash command interaction id to the component custom id
    let componentId = `select${interaction.id}`;

    //Create a tag dropdown menu
    function createDropDown(placeholder,tagsJSON){
        return new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(componentId)
                .setPlaceholder(placeholder)
                .setMinValues(1)
                .setMaxValues(arrayToDisplay.length)
                .addOptions(tagsJSON)
        )
    }

    //Have the bot send a channel message with the user profile and select menu
    // Made this reply ephemeral to not spam the chat
    interaction.reply({embeds: [tagEmbed], components: [createDropDown('Please select a tag',arrayToJSON())], ephemeral: true})
        .then(() => console.log(`Replied to message "${interaction.commandName}"`))
        .catch(console.error);

    const wait = require('util').promisify(setTimeout);
}


// Exporting functions.
// IF ADD OR REMOVE ANY FUNCTIONS, BE SURE TO MODIFY THIS LIST ACCORDINGLY.
module.exports = { command_register, command_unregister, command_profile, command_subscribe, command_unsubscribe }
