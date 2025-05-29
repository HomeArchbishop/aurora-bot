from collections import Counter
import string

s = 'sss,ss.,,sdd'
ex = {'的', '了', '是', '在', '和', '有', '我', '他', '这', '就', '不', '人', '都', '一个', '上', '也', '对', '说', '要', '去'}

# 去标点
for c in s:
  if c in string.punctuation:
    s = s.replace(c, ' ')

word_ls = s.split()
print(f'word_ls: {word_ls}')

cmd = input()
if cmd == 'count_1':
    counter = Counter(word_ls)
    for word, freq in counter.most_common(30):
        print(f'{word} {freq}')
elif cmd == 'count_2':
    counter = Counter(word for word in word_ls if len(word) >= 2)
    for word, freq in counter.most_common(30):
        print(f'{word} {freq}')
elif cmd == 'count_3':
    counter = Counter(word for word in word_ls if len(word) >= 4 and word not in ex)
    for word, freq in counter.most_common(7):
        print(f'{word} {freq}')
else:
    print('Error')