// ==UserScript==
// @name	Steam Game AutoJoin
// @namespace	https://github.com/geekahedron/SteamGameAutoJoin/
// @version	0.1
// @description	Auto-join script for 2015 Summer Steam Monster Minigame
// @author	geekahedron
// @match	*://steamcommunity.com/minigame
// @match	*://steamcommunity.com//minigame
// @updateURL	https://github.com/geekahedron/SteamGameAutoJoin/raw/master/autojoin.user.js
// @downloadURL	https://github.com/geekahedron/SteamGameAutoJoin/raw/master/autojoin.user.js
// @grant	none
// ==/UserScript==

// http://greasemonkey.win-start.de/patterns/add-css.html

function addGlobalStyle(css)
{
	var head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

function GetCurrentGame()
{	
	return JoinGame.toString().match(/'[0-9]*'/)[0].replace(/'/g, '');
}

function DisplayUI()
{
	var game_div = document.getElementsByClassName('section_play')[0].children[0];
	var play_div = document.getElementsByClassName('section_play')[0].children[1];
	if (play_div.className = "current_game")
	{
		var current = GetCurrentGame();
		play_div.children[0].children[0].children[0].innerHTML = "Resume Your Game (" + current + ")";
	}
	var sp = document.createElement("span");
	sp.innerHTML = '<a onClick="javascript:AutoJoinGame()" class="main_btn"><span>Auto Join Game<span></a><input type=text id="autojoinid" name="autojoinid" class="main_btn" />';
	game_div.appendChild(sp,game_div.children[0]);
	addGlobalStyle('.section_play .current_game, .section_play .new_game {  margin-top: 10px; }');
	
}

function CheckAndLeaveCurrentGame( callback )
{
	var currentgame = GetCurrentGame();
	console.log('Current Game: ' + currentgame);

	if (currentgame == 0)
		return callback();

	$J.post(
		'http://steamcommunity.com/minigame/ajaxleavegame/',
		{ 'gameid' : currentgame, 'sessionid' : g_sessionID }
	).done( function() { callback(); }
	);
}

function AutoJoinGame(gameID)
{
	var gameID = document.getElementById("autojoinid").value;
	CheckAndLeaveCurrentGame( function() {
		JoinGameID_Real( gameID );
	});
}

function JoinGameID_Real( gameid )
{
	console.log('Trying to join room ' + gameid);

	$J.post(
		'http://steamcommunity.com/minigame/ajaxjoingame/',
		{ 'gameid' : gameid, 'sessionid' : g_sessionID }
	).done( function( json ) {
			if ( json.success == '1' )
			{
				top.location.href = 'http://steamcommunity.com/minigame/towerattack/';
				return;
			}

			console.log('Failed to join room ' + gameid);
			JoinGameID_Real( gameid );
		}
	).fail( function( jqXHR ) {
			var responseJSON = jqXHR.responseText.evalJSON();
			if ( responseJSON.success == '24' && responseJSON.errorMsg )
				console.log( responseJSON.errorMsg );
			else if ( responseJSON.success == '25' )
				console.log('Failed to join room ' + gameid + ' - Full');
			else
				console.log('Failed to join room ' + gameid);

			JoinGameID_Real( gameid );
		}
	);
}
DisplayUI();
