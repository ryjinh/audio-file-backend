const { deconstructUrl, getExtensionFromUrl, isValidFileExtension, hasUserAndPhraseAndId} = require('../server');


// URL DECONSTRUCTION TESTS
test('Test correct length of deconstructed URL for GET request', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/mp3/', 'get').slice(1, -1).length).toBe(4)
});

test('Test correct length of deconstructed URL for POST request', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/', 'post').length).toBe(4)
});

test('Test correct length of deconstructed URL for GET request without trailing /', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/mp3', 'get').slice(1, -1).length).toBe(4)
});

test('Test correct length of deconstructed URL for POST request without trailing /', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1', 'post').length).toBe(4)
});

test('Ensure that deconstructed url array for GET request has at exactly two numbers [user_id & phrase_id]', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/mp3/', 'get').filter(item => Number.isNaN(Number(item)) == false).length).toBe(2)
});

test('Ensure that deconstructed url array for POST request has at exactly two numbers [user_id & phrase_id]', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/', 'post').filter(item => Number.isNaN(Number(item)) == false).length).toBe(2)
});

test('Ensure that deconstructed url array for GET request has at exactly two numbers [user_id & phrase_id] without trailing / @ end of url', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/mp3', 'get').filter(item => Number.isNaN(Number(item)) == false).length).toBe(2)
});

test('Ensure that deconstructed url array for POST request has at exactly two numbers [user_id & phrase_id] without trailing / @ end of url', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1', 'post').filter(item => Number.isNaN(Number(item)) == false).length).toBe(2)
});

test('Ensure that "user" and "phrase" are included in the array returned by decontructed URL POST request + in the correct order', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/', 'post').filter(item => Number.isNaN(Number(item))).toString() == 'user,phrase');
});

test('Ensure that "user" and "phrase" are included in the array returned by decontructed URL GET request + in the correct order', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/mp3/', 'get').filter(item => Number.isNaN(Number(item))).toString() == 'user,phrase');
});

test('Ensure that "user" and "phrase" are included in the array returned by decontructed URL POST request + in the correct order without trailing / @ url end', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1', 'post').filter(item => Number.isNaN(Number(item))).toString() == 'user,phrase');
});

test('Ensure that "user" and "phrase" are included in the array returned by decontructed URL GET request + in the correct order without trailing / @ url end', () => {
    expect(deconstructUrl('http://localhost:3000/audio/user/1/phrase/1/mp3', 'get').filter(item => Number.isNaN(Number(item))).toString() == 'user,phrase');
});

// Extract uploaded file ext tests
test('Ensure that non mp3 extension returns false', () => {
    expect(isValidFileExtension('pdf')).toBe(false)
});
test('Ensure that mp3 extension returns true', () => {
    expect(isValidFileExtension('mp3')).toBe(true)
});

// Ensure user, phrase and respective IDs are included in request
test('Ensure true user, phrase and ids are included in request and in correct index positions', () => {
    expect(hasUserAndPhraseAndId(['user', 1, 'phrase', 1])).toBe(true)
});
test('Ensure false when user, phrase and ids are either not included or in the wrong position ', () => {
    expect(hasUserAndPhraseAndId(['something', 'is', 'wrong', 'here'])).toBe(false)
});