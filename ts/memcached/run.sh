run () {
	date >> run.out.txt
	../../curlit.sh https://c810g7nd10.execute-api.us-west-2.amazonaws.com/dev/memcached-get/key1 >> run.out.txt
	sleep $1
}

for t in `seq 2400 600 6000`; do
	run $t
done
run 0
