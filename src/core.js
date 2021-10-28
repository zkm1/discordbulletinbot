/*
    core.js holds the major functions required needed for the core functionality of the bot.
*/


// Imports classes from Discord.js
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');


//A generic function used to scan the contents of a message for commands
function command_scan(client_obj, delimiter_open, delimiter_close) {

    //Error checking and setting default values.
    if (typeof delimiter_open == "undefined") {
        throw TypeError("Atleast one delimiter needs to be passed.");
    }
    if (typeof delimiter_close == "undefined") {
        delimiter_close = '';
    }

    //Creating a custom regex expression based on the function's input parameters.
    let reg_ex = new RegExp(delimiter_open + '[a-zA-Z0-9]+' + delimiter_close, 'g');
    //console.log(delimiter_open + '[a-zA-Z0-9]+' + delimiter_close);   //Debug       

    client_obj.on('messageCreate', async (message, interaction) => {
        let command_list = (String(message.content)).match(reg_ex);
        if(command_list == null){
            //If no commands are found, return null
            return null;
        }else{
            //author is the identification of the discord user who sent the message
            let author = message.author;

            //Code to react to the user who used a command
            message.react('👌');

            //Create an embed that displays the message sender's user profile
            const tagEmbed = new MessageEmbed()
            .setColor('#0099ff') 
            .setTitle('Tags')
            .setAuthor(author.username + "'s User Profile", author.avatarURL())
            .setDescription('Some description here')
            .setTimestamp();

            
            //TODO: will import a list of tagas from database
            //just a demo tags list for now
            let demoTagsArr = ['cse101','cse130','cse140'];
            //tagsTOJSON() returns a list of options objects, we can just .addOptions(tagsToJSON())later
            function tagsToJSON() {
                let optionsJSONArray = []
                demoTagsArr.map((eachTag)=> {
                    optionsJSONArray.push({label: eachTag, value: eachTag})
                })
                return optionsJSONArray;
            }

            //Create a tag dropdown menu
            function createDropDown(placeholder,tagsJSON){
                return new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`select${message.id}`)
                        .setPlaceholder(placeholder)
                        .setMinValues(1)
                        .setMaxValues(demoTagsArr.length)
                        .addOptions(tagsJSON)
                )
            }

            //Record the message's component id to compare with the interaction component id
            let messageId = `select${message.id}`;

            //Have the bot send a channel message with the user profile and select menu
            //!! This will later be an ephemeral message if it is triggered by a slash command (hopefully!)
            //!! the slash command interaction allow interaction.reply({ephemeral: true})
            await message.channel.send({embeds: [tagEmbed], components: [createDropDown('Please select a tag',tagsToJSON())]})
                .then(() => console.log(`Replied to message "${message.content}"`))
                .catch(console.error);
      
            const wait = require('util').promisify(setTimeout);

            //Select Menu Interaction
            client_obj.on('interactionCreate', async interaction => {
                if (!interaction.isSelectMenu()) return;
                console.log(interaction.user, interaction.id, interaction.component, messageId);
                if (interaction.customId === messageId && interaction.user.id === author.id
                                                      && interaction.channelId === message.channelId ) {
                    // console.log('Only the interaction component id associated with the msg's component id passes through!!')                                      
                    await interaction.deferUpdate()                                     
                    .catch(console.error);
                    //Delete message components                                    
                    await interaction.editReply({content: 'you selected '+ interaction.values, embeds: [], components: []})
                    .then((message) => console.log(`Reply sent`))
                    .catch(console.error);

                    await wait(10000);
                    //Delete the selection message
                    await interaction.deleteReply()
                    .catch(console.error);
                }
            })

            return { 'author' : author , 'command_list' : command_list};
        }
    });
}


module.exports = {command_scan}