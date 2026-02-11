const mongoose = require("mongoose");
const PrebuiltAIFriend = require('../models/PrebuiltAIFriend.js');
const Story = require('../models/Story.js');

exports.GetStatus = async (req, res) => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // First, try to get stories created in last 2 days
        const recentStories = await Story.aggregate([
            {
                $match: {
                    createdAt: { $gte: twoDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        characterId: "$characterId",
                        characterName: "$characterName",
                        characterAge: "$characterAge",
                        characterOccupation: "$characterOccupation",
                        characterAvatar:"$characterAvatar"
                    },
                    stories: {
                        $push: {
                            _id: "$_id",
                            title: "$title",
                            slug: "$slug",
                            category: "$category",
                            city: "$city",
                            backgroundImage: "$backgroundImage",
                            imageAlbum: { $slice: ["$imageAlbum", 1] }, // Only first image
                            tags: { $slice: ["$tags", 2] }, // Max 2 tags
                            createdAt: "$createdAt",
                            excerpt: "$excerpt",
                            readCount: "$readCount",
                            featured: "$featured",
                            trending: "$trending"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    characterId: "$_id.characterId",
                    characterName: "$_id.characterName",
                    characterAge: "$_id.characterAge",
                    characterOccupation: "$_id.characterOccupation",
               characterAvatar:"$_id.characterAvatar",
                    stories: 1
                }
            },
            {
                $sort: {
                    characterName: 1
                }
            }
        ]);

        let result = recentStories;

        // If we have less than 7 characters from recent stories, fetch more
        if (result.length < 7) {
            const neededCount = 7 - result.length;
            const recentCharacterIds = result.map(char => char.characterId);
            
            // Get latest stories excluding recent characters
            const latestStories = await Story.aggregate([
                {
                    $match: {
                        characterId: { $nin: recentCharacterIds }
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: {
                            characterId: "$characterId",
                            characterName: "$characterName",
                            characterAge: "$characterAge",
                            characterOccupation: "$characterOccupation",
                                                    characterAvatar:"$characterAvatar"
                        },
                        stories: {
                            $push: {
                                _id: "$_id",
                                title: "$title",
                                slug: "$slug",
                                category: "$category",
                                city: "$city",
                                backgroundImage: "$backgroundImage",
                                imageAlbum: { $slice: ["$imageAlbum", 1] },
                                tags: { $slice: ["$tags", 2] },
                                createdAt: "$createdAt",
                                excerpt: "$excerpt",
                                readCount: "$readCount",
                                featured: "$featured",
                                trending: "$trending"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        characterId: "$_id.characterId",
                        characterName: "$_id.characterName",
                        characterAge: "$_id.characterAge",
                        characterOccupation: "$_id.characterOccupation",
                                                characterAvatar:"$_id.characterAvatar",
                        stories: 1
                    }
                },
                {
                    $sort: { characterName: 1 }
                },
                {
                    $limit: neededCount
                }
            ]);

            result = [...result, ...latestStories];
        }

        // Ensure we have exactly 7 characters (if possible)
        if (result.length > 7) {
            result = result.slice(0, 7);
        }

        // Process each character: limit to 1-3 stories, ensure max 2 tags per story
        const processedResult = result.map(character => ({
            ...character,
            stories: character.stories
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3) // Max 3 stories per character
                .map(story => ({
                    ...story,
                    tags: story.tags ? story.tags.slice(0, 2) : [] // Ensure max 2 tags
                }))
        }));

        // Filter out characters who don't have any stories after processing
        const finalResult = processedResult.filter(character => 
            character.stories && character.stories.length > 0
        );

        return res.status(200).json({ 
            success: true,
            count: finalResult.length,
            data: finalResult 
        });

    } catch (error) {
        console.error('GetStatus Error:', error.message);
        return res.status(500).json({ 
            success: false,
            message: error.message || "Internal Server Error" 
        });
    }
}